import { randomBytes } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { createAgentDeviceClient } from 'agent-device';

import { startBootRelay, type BootRelay } from './relay.ts';

import type { DeviceLease, DeviceProvider, DeviceRequest } from '@e2e-dev/mobile';

/** Where a simlock worker (or gateway) answers, and the agent token the run leases with. */
interface SimlockOptions {
    /** `http://10.10.1.28:4701`: the worker's HTTP address, without `/v1`. */
    readonly url: string;
    readonly token: string;
    /** The platform to lease: simlock's `ios-instance` or `android-instance` backend. */
    readonly platform: 'ios' | 'android';
    /** A model simlock's catalog lists: `iPhone 17 Pro`, `Galaxy Nexus`. */
    readonly device: string;
    /** A runtime the catalog lists for that model (`34` is the Android `aosp_atd` image); the farm's default otherwise. */
    readonly osVersion?: string;
    /**
     * Lease TTL, renewed every third of it while the run holds the lease. Short on purpose: a
     * run killed before it releases (a cancelled CI job) frees its simulator within one TTL.
     */
    readonly ttlMs?: number;
    /**
     * Uploads in flight at once. Each one carries the whole app through the gateway, and a
     * request through the public Cloudflare tunnel that runs past 100 s ends in a 524: ten
     * at once on a busy farm did, so the run uploads a few at a time.
     */
    readonly installConcurrency?: number;
    /**
     * How long a slot may wait for the farm to have a device free. A lease request blocks while the
     * farm is full, and through the public Cloudflare tunnel a request open past 100 s ends in a 524,
     * so the slot waits here, polling the farm's free count, and only then asks for a lease.
     */
    readonly queueMs?: number;
}

/** A counting semaphore: `run` waits until fewer than `limit` calls are in flight. */
function limiter(limit: number): <T>(work: () => Promise<T>) => Promise<T> {
    let active = 0;
    const waiting: (() => void)[] = [];
    return async work => {
        while (active >= limit) {
            await new Promise<void>(resolve => waiting.push(resolve));
        }
        active += 1;
        try {
            return await work();
        } finally {
            active -= 1;
            waiting.shift()?.();
        }
    };
}

interface Held extends DeviceLease {
    readonly stop: () => void;
    readonly scope: {
        tenant: string;
        runId: string;
        leaseId: string;
        leaseBackend: 'ios-instance' | 'android-instance';
        leaseProvider: 'proxy';
        clientId: string;
        deviceKey?: string;
    };
}

const TENANT = 'rnw-community-e2e';

/** A leased device that could not be set up (an app install failed): another device may well succeed. */
class DeviceSetupFailed extends Error {}

/** A lease request the tunnel cut off while the farm was full: the slot waits for a device and asks again. */
const LEASE_CUT_OFF = /Invalid daemon response|error code: 524/i;

const sleep = (ms: number, signal: AbortSignal): Promise<void> =>
    new Promise((resolve, reject) => {
        if (signal.aborted) {
            reject(signal.reason);
            return;
        }
        const timer = setTimeout(resolve, ms);
        signal.addEventListener(
            'abort',
            () => {
                clearTimeout(timer);
                reject(signal.reason);
            },
            { once: true }
        );
    });

/** Errors that mean the farm, not one simulator, failed (simlock's gateway and agent-device wording). */
const FARM_DOWN =
    /not connected to the gateway|no worker connected|Remote daemon is unavailable|ECONNREFUSED|ETIMEDOUT|fetch failed|error code: 52\d/i;

/**
 * Leases one simulator or emulator per worker slot from a simlock worker through its
 * agent-device proxy (`/v1/agent-device`): the run drives the device from
 * this machine, Linux included, and the app is uploaded, not copied to the
 * worker. Every slot holds its own lease; release hands it back and simlock
 * wipes the device for the next one.
 */
export function simlockDevices(options: SimlockOptions): DeviceProvider {
    const baseUrl = `${options.url.replace(/\/$/, '')}/v1/agent-device`;
    const ttlMs = options.ttlMs ?? 3 * 60_000;
    const held = new Map<string, Held>();
    const uploads = limiter(Math.max(1, options.installConcurrency ?? 3));
    let relay: Promise<BootRelay> | undefined;

    const client = (session: string) =>
        createAgentDeviceClient({ daemonBaseUrl: baseUrl, daemonAuthToken: options.token, session });
    const startRelay = (): Promise<BootRelay> => {
        relay ??= startBootRelay(baseUrl).catch((cause: unknown) => {
            relay = undefined;
            throw cause;
        });
        return relay;
    };

    /**
     * Every lease id this run acquired, in `.e2e/simlock-leases.json`: mobile-ci's e2e job
     * releases them in an `if: always()` step, so a run killed mid-way still frees the farm.
     */
    const recordLease = (projectRoot: string, id: string): void => {
        const file = join(projectRoot, '.e2e', 'simlock-leases.json');
        let ids: string[] = [];
        try {
            ids = JSON.parse(readFileSync(file, 'utf8')) as string[];
        } catch {
            ids = [];
        }
        mkdirSync(join(projectRoot, '.e2e'), { recursive: true });
        writeFileSync(file, JSON.stringify([...new Set([...ids, id])]));
    };

    /** Free devices of the platform on the farm (limit minus devices leased), or undefined when the farm does not say. */
    const freeDevices = async (): Promise<number | undefined> => {
        try {
            const response = await fetch(`${options.url.replace(/\/$/, '')}/v1/status`, {
                headers: { authorization: `Bearer ${options.token}` },
                signal: AbortSignal.timeout(15_000),
            });
            if (!response.ok) {
                return undefined;
            }
            const capacity = (
                (await response.json()) as {
                    capacity?: Partial<Record<SimlockOptions['platform'], { limit?: number; used?: number; warm?: number }>>;
                }
            ).capacity?.[options.platform];
            if (capacity?.limit === undefined) {
                return undefined;
            }
            return capacity.limit - ((capacity.used ?? 0) - (capacity.warm ?? 0));
        } catch {
            return undefined;
        }
    };

    /** Blocks until the farm reports a free device or the queue deadline passes; an unknown count does not block. */
    const waitForDevice = async (request: DeviceRequest, deadline: number): Promise<void> => {
        let logged = false;
        for (;;) {
            const free = await freeDevices();
            if (free === undefined || free > 0) {
                return;
            }
            if (Date.now() > deadline) {
                throw new Error(
                    `simlock: no free device on the farm within the ${Math.round((options.queueMs ?? 20 * 60_000) / 60_000)} min queue`
                );
            }
            if (!logged) {
                request.log('simlock: the farm is full; waiting for a free device');
                logged = true;
            }
            await sleep(10_000 + Math.floor(Math.random() * 5_000), request.signal);
        }
    };

    /** `allocate`, queued client-side: a request the tunnel cut off is released by its own id and asked again. */
    const allocate = async (
        request: DeviceRequest,
        c: ReturnType<typeof client>,
        params: Omit<Parameters<ReturnType<typeof client>['leases']['allocate']>[0], 'leaseId'>
    ): Promise<Awaited<ReturnType<ReturnType<typeof client>['leases']['allocate']>>> => {
        const deadline = Date.now() + (options.queueMs ?? 20 * 60_000);
        for (;;) {
            await waitForDevice(request, deadline);
            request.signal.throwIfAborted();
            const leaseId = randomBytes(16).toString('hex');
            try {
                return await c.leases.allocate({ ...params, leaseId });
            } catch (cause) {
                const message = cause instanceof Error ? cause.message : String(cause);
                if (!LEASE_CUT_OFF.test(message)) {
                    throw cause;
                }
                // The farm may still grant it after the cut-off: hand that lease back, whether or not we ask again.
                const { tenant, runId, leaseBackend, leaseProvider, clientId } = params;
                await c.leases
                    .release({ tenant, runId, leaseBackend, leaseProvider, clientId, leaseId })
                    .catch(() => undefined);
                if (Date.now() > deadline) {
                    throw cause;
                }
                request.log(`simlock: lease request cut off while the farm was full (${message}); waiting to ask again`);
            }
        }
    };

    const leaseOnce = async (request: DeviceRequest, attempt: number): Promise<DeviceLease> => {
        const session = `e2e-${request.runId.slice(0, 12)}-${request.slot}${attempt === 0 ? '' : `-r${attempt}`}`;
        const started = Date.now();
        const scopeBase = {
            tenant: TENANT,
            runId: request.runId,
            leaseBackend: `${options.platform}-instance` as const,
            leaseProvider: 'proxy' as const,
        };
        const c = client(session);
        const clientId = randomBytes(8).toString('hex');
        const lease = await allocate(request, c, {
            ...scopeBase,
            clientId,
            ttlMs,
            platform: options.platform,
            target: 'mobile',
            device: options.device,
            ...(options.osVersion === undefined ? {} : { osVersion: options.osVersion }),
        });
        const scope = {
            ...scopeBase,
            leaseId: lease.leaseId,
            clientId: lease.clientId ?? clientId,
            ...(lease.deviceKey === undefined ? {} : { deviceKey: lease.deviceKey }),
        };
        // The proxy lists every device its token holds, so each command names the leased one:
        // a simulator by UDID (`ios:mobile:<udid>`), an emulator by adb serial (`android:mobile:<serial>`).
        const udid = lease.deviceKey?.split(':').pop();
        const selection = options.platform === 'android' ? { serial: udid } : { udid };
        recordLease(request.projectRoot, lease.leaseId);
        request.log(
            `simlock lease ${lease.leaseId} granted in ${Date.now() - started} ms (${options.device} ${udid ?? 'no udid'})`
        );
        let missedHeartbeats = 0;
        const timer = setInterval(
            () => {
                c.leases
                    .heartbeat({ ...scope, ttlMs })
                    .then(() => {
                        missedHeartbeats = 0;
                    })
                    .catch((cause: unknown) => {
                        missedHeartbeats += 1;
                        request.log(
                            missedHeartbeats >= 2
                                ? `simlock lease ${lease.leaseId} missed ${missedHeartbeats} heartbeats: it may have expired, and failures on its device are infrastructure, not tests (${String(cause)})`
                                : `simlock heartbeat failed: ${String(cause)}`
                        );
                    });
            },
            Math.max(10_000, Math.floor(ttlMs / 3))
        );
        timer.unref();
        try {
            if (udid === undefined) {
                throw new Error(`simlock lease ${lease.leaseId} names no device (deviceKey ${String(lease.deviceKey)})`);
            }
            request.signal.throwIfAborted();
            let installedApp: string | undefined;
            const scoped = createAgentDeviceClient({
                daemonBaseUrl: baseUrl,
                daemonAuthToken: options.token,
                session,
                ...scope,
            });
            const install = async (appPath: string, app?: string): Promise<void> => {
                try {
                    await uploads(() =>
                        scoped.apps.install({
                            platform: options.platform,
                            ...selection,
                            appPath,
                            ...(app === undefined ? {} : { app }),
                        })
                    );
                } catch (cause) {
                    throw new DeviceSetupFailed(`${String(cause instanceof Error ? cause.message : cause)} (${udid})`, {
                        cause,
                    });
                }
            };
            if (request.appPath !== undefined) {
                const installStarted = Date.now();
                await install(request.appPath, request.app);
                installedApp = request.app;
                request.log(`simlock uploaded and installed ${installedApp} in ${Date.now() - installStarted} ms`);
            }
            const entry: Held = {
                id: lease.leaseId,
                daemon: { baseUrl: (await startRelay()).baseUrl, authToken: options.token },
                client: scope,
                deviceId: udid,
                ...(installedApp === undefined ? {} : { installedApp }),
                stop: () => clearInterval(timer),
                scope,
            };
            held.set(entry.id, entry);
            return entry;
        } catch (cause) {
            // The engine releases only leases acquire returned: hand this one back now, not one TTL later.
            clearInterval(timer);
            await c.leases
                .release(scope)
                .catch((cleanup: unknown) =>
                    request.log(`simlock release after a failed acquire failed: ${String(cleanup)}`)
                );
            throw cause;
        }
    };

    return {
        name: 'simlock',
        async acquire(request: DeviceRequest): Promise<DeviceLease> {
            if (request.platform !== options.platform) {
                throw new Error(`simlockDevices leases ${options.platform} devices, not ${request.platform}`);
            }
            try {
                return await leaseOnce(request, 0);
            } catch (cause) {
                // One bad simulator must not fail the whole run: its lease is already released,
                // so lease another device, once. A second failure is the farm's, and is reported.
                // A farm that is unreachable or has lost its worker fails every slot at once: a
                // swap then only doubles the wipes on an already overloaded host, so it fails now.
                if (!(cause instanceof DeviceSetupFailed) || FARM_DOWN.test(cause.message)) {
                    throw cause;
                }
                request.signal.throwIfAborted();
                request.log(`simlock: ${cause.message}; leasing another device`);
                return leaseOnce(request, 1);
            }
        },
        async release(lease: DeviceLease, context): Promise<void> {
            const entry = held.get(lease.id);
            if (entry === undefined) {
                return;
            }
            entry.stop();
            try {
                await client(`release-${lease.id.slice(0, 8)}`).leases.release({ ...entry.scope, signal: context.signal });
            } finally {
                // A failed release still frees this process: the farm reclaims the lease after one TTL.
                held.delete(lease.id);
                if (held.size === 0 && relay !== undefined) {
                    const closing = relay;
                    relay = undefined;
                    await (await closing).close();
                }
            }
        },
    };
}
