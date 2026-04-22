import { describe, expect, it } from '@jest/globals';

import { inMemoryHistogramTransportMock } from './in-memory-histogram-transport.mock';

describe('inMemoryHistogramTransportMock', () => {
    it('records observations and returns them from snapshot', () => {
        expect.assertions(3);
        const transport = inMemoryHistogramTransportMock();

        transport.observe('metric_a', 10);
        transport.observe('metric_b', 20, { env: 'test' });

        const snap = transport.snapshot();
        expect(snap).toHaveLength(2);
        expect(snap[0]).toEqual({ name: 'metric_a', durationMs: 10 });
        expect(snap[1]).toEqual({ name: 'metric_b', durationMs: 20, labels: { env: 'test' } });
    });

    it('clears the store after snapshot', () => {
        expect.assertions(2);
        const transport = inMemoryHistogramTransportMock();

        transport.observe('x', 1);
        const first = transport.snapshot();
        const second = transport.snapshot();

        expect(first).toHaveLength(1);
        expect(second).toHaveLength(0);
    });

    it('accumulates multiple observations between snapshots', () => {
        expect.assertions(1);
        const transport = inMemoryHistogramTransportMock();

        transport.observe('m', 5);
        transport.observe('m', 7);
        transport.observe('m', 9);

        expect(transport.snapshot()).toHaveLength(3);
    });
});
