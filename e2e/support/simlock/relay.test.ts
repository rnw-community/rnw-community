import assert from 'node:assert/strict';
import { createServer, type IncomingMessage } from 'node:http';
import { after, before, describe, it } from 'node:test';

import { forUpstream, startBootRelay, type RelayOptions } from './relay.ts';

import type { AddressInfo } from 'node:net';

const IOS: RelayOptions = { platform: 'ios' };
const ANDROID: RelayOptions = { platform: 'android' };
const FULL_IOS: RelayOptions = { platform: 'ios', deviceMode: 'full' };

const ALLOCATE = {
    jsonrpc: '2.0',
    id: 1,
    method: 'agent_device.lease.allocate',
    params: { platform: 'ios', device: 'iPhone 17 Pro' },
};
const HEARTBEAT = { jsonrpc: '2.0', id: 2, method: 'agent_device.lease.heartbeat', params: { leaseId: 'lease' } };
const SNAPSHOT = {
    jsonrpc: '2.0',
    id: 3,
    method: 'agent_device.command',
    params: { command: 'snapshot', positionals: [], flags: {} },
};
const CLICK = {
    jsonrpc: '2.0',
    id: 4,
    method: 'agent_device.command',
    params: { command: 'click', positionals: ['@e1'], flags: {} },
};
const SCREENSHOT = {
    jsonrpc: '2.0',
    id: 5,
    method: 'agent_device.command',
    params: { command: 'screenshot', positionals: ['/tmp/shot.png'], flags: { udid: 'UDID', screenshotPixelDensity: 3 } },
};

describe('simlock relay upstream rewrites', () => {
    it('adds the deviceMode to a lease allocate', () => {
        assert.deepEqual(forUpstream(ALLOCATE, FULL_IOS), {
            ...ALLOCATE,
            params: { ...ALLOCATE.params, deviceMode: 'full' },
        });
    });

    it('leaves an allocate alone without a deviceMode', () => {
        assert.equal(forUpstream(ALLOCATE, IOS), ALLOCATE);
    });

    it('takes an iOS screenshot with the XCTest runner, at the density it already captures', () => {
        assert.deepEqual(forUpstream(SCREENSHOT, IOS), {
            ...SCREENSHOT,
            params: { ...SCREENSHOT.params, flags: { udid: 'UDID', screenshotCaptureBackend: 'runner' } },
        });
    });

    it('leaves an Android screenshot alone', () => {
        assert.equal(forUpstream(SCREENSHOT, ANDROID), SCREENSHOT);
    });

    it('leaves every other call alone', () => {
        for (const rpc of [HEARTBEAT, SNAPSHOT, CLICK]) {
            assert.equal(forUpstream(rpc, FULL_IOS), rpc);
        }
    });
});

describe('simlock relay forwarding', () => {
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
    before(() => new Promise<void>(resolve => upstream.listen(0, '127.0.0.1', resolve)));
    after(() => new Promise<void>(resolve => upstream.close(() => resolve())));

    it('sends the rewritten request upstream', async () => {
        const { port } = upstream.address() as AddressInfo;
        const relay = await startBootRelay(`http://127.0.0.1:${port}/v1/agent-device`, FULL_IOS);
        try {
            const response = await fetch(`${relay.baseUrl}/rpc`, { method: 'POST', body: JSON.stringify(ALLOCATE) });
            assert.equal(response.status, 200);
            assert.deepEqual(received.pop(), forUpstream(ALLOCATE, FULL_IOS));
        } finally {
            await relay.close();
        }
    });
});
