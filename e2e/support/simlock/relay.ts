import { createServer, request as httpRequest, type IncomingMessage, type Server } from 'node:http';
import { request as httpsRequest } from 'node:https';
import { pipeline } from 'node:stream/promises';

import type { AddressInfo } from 'node:net';

/**
 * A loopback relay in front of simlock's agent-device proxy. simlock's daemon
 * policy denies `boot` (it grants devices already booted), while the e2e
 * mobile engine boots its device in `prepare`. The relay answers `boot` for
 * the UDID the engine names, the leased and already booted simulator; every
 * other request, uploads included, passes through untouched, except that a
 * lease allocate gains the relay's `deviceMode`.
 */
export interface BootRelay {
    readonly baseUrl: string;
    close(): Promise<void>;
}

const DEBUG = process.env.SIMLOCK_RELAY_DEBUG === '1';

class RefusedTarget extends Error {}

type Headers = Record<string, string | string[] | undefined>;

/** Headers that apply to one hop only (RFC 9110 §7.6.1), plus any the Connection header names. */
const HOP_BY_HOP = [
    'connection',
    'keep-alive',
    'proxy-authenticate',
    'proxy-authorization',
    'proxy-connection',
    'te',
    'trailer',
    'transfer-encoding',
    'upgrade',
];

function endToEnd(headers: Headers): Headers {
    const named = String(headers.connection ?? '')
        .split(',')
        .map(name => name.trim().toLowerCase())
        .filter(Boolean);
    const result: Headers = { ...headers };
    for (const name of [...HOP_BY_HOP, ...named]) {
        delete result[name];
    }
    return result;
}

/**
 * `full` leases an unslimmed device (PassKit and the other services a slim one switches off); unset is the farm's
 * default, `slim`. agent-device's client drops lease fields it does not know, so the relay adds it to the allocate.
 */
export type DeviceMode = 'slim' | 'full';

export async function startBootRelay(upstreamBaseUrl: string, deviceMode?: DeviceMode): Promise<BootRelay> {
    const upstream = new URL(upstreamBaseUrl.endsWith('/') ? upstreamBaseUrl : `${upstreamBaseUrl}/`);
    const send = upstream.protocol === 'https:' ? httpsRequest : httpRequest;

    // Where every request goes: fixed from the configured gateway, never from the request.
    const destination = {
        protocol: upstream.protocol,
        hostname: upstream.hostname,
        port: upstream.port === '' ? undefined : Number(upstream.port),
        host: upstream.host,
        base: upstream.pathname.replace(/\/+$/, ''),
    };

    /**
     * The upstream path for a request's target: its path and query only, under the gateway's
     * agent-device base. Anything but an origin-form target made of plain path characters
     * (an absolute-form `http://elsewhere/`, `//host`, a `..` segment) is refused, so the relay
     * can only ever reach the simlock gateway.
     */
    const upstreamPath = (requestTarget: string): string => {
        if (
            !/^\/(?!\/)[A-Za-z0-9._~!$&'()*+,;=:@%/?-]*$/.test(requestTarget) ||
            /(^|\/)\.\.?(\/|\?|$)/.test(requestTarget) ||
            /%(2e|2f|5c)/i.test(requestTarget)
        ) {
            throw new RefusedTarget(requestTarget);
        }
        return `${destination.base}${requestTarget}`;
    };

    const forward = (incoming: IncomingMessage, requestTarget: string, body?: Buffer) =>
        new Promise<{
            status: number;
            headers: Record<string, string | string[] | undefined>;
            body?: Buffer;
            stream?: IncomingMessage;
        }>((resolve, reject) => {
            const path = upstreamPath(requestTarget);
            const headers: Headers = { ...endToEnd(incoming.headers), host: destination.host };
            if (body !== undefined) {
                headers['content-length'] = String(body.length);
            }
            const options = {
                protocol: destination.protocol,
                hostname: destination.hostname,
                port: destination.port,
                path,
                method: incoming.method,
                headers,
            };
            const out = send(options, response => {
                if (body === undefined) {
                    return resolve({ status: response.statusCode ?? 502, headers: response.headers, stream: response });
                }
                const chunks: Buffer[] = [];
                response.on('data', (chunk: Buffer) => chunks.push(chunk));
                response.on('end', () =>
                    resolve({ status: response.statusCode ?? 502, headers: response.headers, body: Buffer.concat(chunks) })
                );
                response.on('error', reject);
            });
            out.on('error', reject);
            if (body !== undefined) {
                out.end(body);
            } else {
                incoming.pipe(out);
            }
        });

    const server: Server = createServer(async (incoming, outgoing) => {
        try {
            const path = incoming.url ?? '/';
            if (incoming.method !== 'POST' || !(path === '/rpc' || path.startsWith('/rpc?'))) {
                const reply = await forward(incoming, path);
                outgoing.writeHead(reply.status, endToEnd(reply.headers));
                // A client that goes away stops the upstream transfer, and a broken upstream ends the reply.
                pipeline(reply.stream!, outgoing).catch(() => reply.stream!.destroy());
                return;
            }
            const chunks: Buffer[] = [];
            for await (const chunk of incoming) {
                chunks.push(chunk as Buffer);
            }
            const raw = Buffer.concat(chunks);
            const rpc = JSON.parse(raw.toString('utf8')) as { params?: { command?: string } } & Record<string, unknown>;
            const upstreamBody =
                deviceMode !== undefined && rpc.method === 'agent_device.lease.allocate'
                    ? Buffer.from(JSON.stringify({ ...rpc, params: { ...rpc.params, deviceMode } }))
                    : raw;
            const command = rpc.params?.command;
            const positionals = (rpc.params as { positionals?: unknown[] } | undefined)?.positionals ?? [];
            if (command === 'close' && positionals.length === 0) {
                // A session close ends a simlock proxy lease and wipes the simulator, and the
                // engine closes a slot's session on a worker respawn or a recording reset mid-run.
                // The lease's life is the provider's: it releases it at the end of the run. (A bare
                // device.closeApp() is such a close too, so it leaves the app running here.)
                if (DEBUG) {
                    console.error('[relay] close answered locally; the provider releases the lease');
                }
                const session = (rpc.params as { session?: unknown } | undefined)?.session;
                const data = { session: typeof session === 'string' ? session : '', identifiers: { session } };
                const body = Buffer.from(JSON.stringify({ jsonrpc: '2.0', id: rpc.id, result: { ok: true, data } }));
                outgoing.writeHead(200, { 'content-type': 'application/json', 'content-length': String(body.length) });
                outgoing.end(body);
                return;
            }
            if (command !== 'boot') {
                const reply = await forward(incoming, path, upstreamBody);
                if (DEBUG) {
                    console.error(`[relay] ${command} -> ${reply.status}`);
                }
                outgoing.writeHead(reply.status, endToEnd(reply.headers));
                outgoing.end(reply.body);
                return;
            }
            // Answered here, not upstream: simlock's `devices` for a token holding several leases
            // collides with itself ("Request ID is already in flight"), and the leased device is
            // already booted. The engine names it by UDID; that is all a boot answer needs.
            const flags = ((rpc.params as Record<string, unknown> | undefined)?.flags ?? {}) as Record<string, unknown>;
            // A simulator is named by UDID, an Android emulator by adb serial.
            const serial = typeof flags.serial === 'string' ? flags.serial : undefined;
            const udid = typeof flags.udid === 'string' ? flags.udid : serial;
            if (udid === undefined) {
                outgoing.writeHead(200, { 'content-type': 'application/json' });
                outgoing.end(
                    JSON.stringify({
                        jsonrpc: '2.0',
                        id: rpc.id,
                        error: {
                            code: -32000,
                            message: 'simlock relay: boot names no udid or serial',
                            data: { code: 'INVALID_ARGS', message: 'simlock relay: boot names no udid or serial' },
                        },
                    })
                );
                return;
            }
            const data =
                serial === undefined
                    ? { platform: 'ios', target: 'mobile', device: udid, id: udid, kind: 'simulator', booted: true }
                    : { platform: 'android', target: 'mobile', device: serial, id: serial, kind: 'emulator', booted: true };
            if (DEBUG) {
                console.error(`[relay] boot ${udid} answered locally`);
            }
            const body = Buffer.from(JSON.stringify({ jsonrpc: '2.0', id: rpc.id, result: { ok: true, data } }));
            outgoing.writeHead(200, { 'content-type': 'application/json', 'content-length': String(body.length) });
            outgoing.end(body);
        } catch (cause) {
            if (cause instanceof RefusedTarget) {
                outgoing.writeHead(400, { 'content-type': 'text/plain' });
                outgoing.end(`simlock relay: refused request target ${cause.message}`);
                return;
            }
            outgoing.writeHead(502, { 'content-type': 'text/plain' });
            outgoing.end(`simlock relay: ${String(cause)}`);
        }
    });
    await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve));
    const { port } = server.address() as AddressInfo;
    return {
        baseUrl: `http://127.0.0.1:${port}`,
        close: () => new Promise(resolve => server.close(() => resolve())),
    };
}
