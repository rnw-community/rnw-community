import assert from 'node:assert/strict';
import { createServer, type IncomingMessage } from 'node:http';
import { after, before, describe, it } from 'node:test';

import { startBootRelay, type BootRelay, type DeviceMode } from './relay.ts';

import type { AddressInfo } from 'node:net';

const received: unknown[] = [];
const upstream = createServer(async (incoming: IncomingMessage, outgoing) => {
    const chunks: Buffer[] = [];
    for await (const chunk of incoming) {
        chunks.push(chunk as Buffer);
    }
    received.push(JSON.parse(Buffer.concat(chunks).toString('utf8')));
    outgoing.writeHead(200, { 'content-type': 'application/json' });
    outgoing.end('{"jsonrpc":"2.0","id":1,"result":{"ok":true,"data":{}}}');
});

const ALLOCATE = {
    jsonrpc: '2.0',
    id: 1,
    method: 'agent_device.lease.allocate',
    params: { platform: 'ios', device: 'iPhone 17 Pro' },
};
const COMMAND = { jsonrpc: '2.0', id: 2, method: 'agent_device.command', params: { command: 'snapshot', positionals: [] } };

async function forwarded(deviceMode: DeviceMode | undefined, rpc: object): Promise<unknown> {
    const { port } = upstream.address() as AddressInfo;
    const relay: BootRelay = await startBootRelay(`http://127.0.0.1:${port}/v1/agent-device`, deviceMode);
    try {
        const response = await fetch(`${relay.baseUrl}/rpc`, { method: 'POST', body: JSON.stringify(rpc) });
        assert.equal(response.status, 200);
        return received.pop();
    } finally {
        await relay.close();
    }
}

describe('simlock relay deviceMode', () => {
    before(() => new Promise<void>(resolve => upstream.listen(0, '127.0.0.1', resolve)));
    after(() => new Promise<void>(resolve => upstream.close(() => resolve())));

    it('adds deviceMode to a lease allocate', async () => {
        assert.deepEqual(await forwarded('full', ALLOCATE), {
            ...ALLOCATE,
            params: { ...ALLOCATE.params, deviceMode: 'full' },
        });
    });

    it('forwards an allocate unchanged without a deviceMode', async () => {
        assert.deepEqual(await forwarded(undefined, ALLOCATE), ALLOCATE);
    });

    it('never adds deviceMode to any other call', async () => {
        assert.deepEqual(await forwarded('full', COMMAND), COMMAND);
    });
});
