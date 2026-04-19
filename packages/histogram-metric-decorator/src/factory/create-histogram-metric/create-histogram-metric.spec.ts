import { beforeEach, describe, expect, it } from '@jest/globals';

import { createHistogramMetric, inMemoryHistogramTransport } from '../../index';

const transport = inMemoryHistogramTransport();
const HistogramMetric = createHistogramMetric({ transport });
const HistogramMetricWithStrategy = createHistogramMetric({
    transport,
    strategies: [{ matches: () => false, handle: <TVal>(val: TVal): TVal => val }],
});

class OrderService {
    @HistogramMetric()
    placeOrderSync(productId: string, qty: number): string {
        return `receipt-${productId}-${qty.toString()}`;
    }

    @HistogramMetric({ name: 'order_fetch_ms', labels: ([orderId]: readonly [string]) => ({ orderId }) })
    async fetchOrder(orderId: string): Promise<{ readonly id: string }> {
        return { id: orderId };
    }

    @HistogramMetric({ name: 'order_charge_ms' })
    async chargeOrder(_orderId: string): Promise<never> {
        throw new Error('payment declined');
    }

    @HistogramMetric({ name: 'order_refund_ms', labels: ([orderId]: readonly [string]) => ({ orderId }) })
    async refundOrder(_orderId: string): Promise<never> {
        throw new Error('refund failed');
    }

    @HistogramMetricWithStrategy()
    cancelOrder(orderId: string): string {
        return `cancelled-${orderId}`;
    }

    @HistogramMetric()
    submitOrder(): never {
        throw new Error('out of stock');
    }
}

describe('createHistogramMetric', () => {
    beforeEach(() => {
        transport.snapshot();
    });

    it('records one observation when a sync method returns', () => {
        expect.hasAssertions();
        new OrderService().placeOrderSync('sku-42', 3);
        expect(transport.snapshot()).toHaveLength(1);
    });

    it('uses ClassName_methodName_duration_ms as the default metric name', () => {
        expect.hasAssertions();
        new OrderService().placeOrderSync('sku-1', 1);
        const observations = transport.snapshot();
        expect(observations[0]).toMatchObject({ name: 'OrderService_placeOrderSync_duration_ms' });
    });

    it('uses the explicit name option when supplied', async () => {
        expect.hasAssertions();
        await new OrderService().fetchOrder('ord-1');
        const observations = transport.snapshot();
        expect(observations[0]).toMatchObject({ name: 'order_fetch_ms' });
    });

    it('records one observation after a Promise resolves', async () => {
        expect.hasAssertions();
        await new OrderService().fetchOrder('ord-2');
        expect(transport.snapshot()).toHaveLength(1);
    });

    it('records one observation after a Promise rejects', async () => {
        expect.hasAssertions();
        await expect(new OrderService().chargeOrder('ord-3')).rejects.toThrow('payment declined');
        expect(transport.snapshot()).toHaveLength(1);
    });

    it('includes labels derived from method arguments in the observation', async () => {
        expect.hasAssertions();
        await new OrderService().fetchOrder('ord-123');
        expect(transport.snapshot()[0]).toMatchObject({ labels: { orderId: 'ord-123' } });
    });

    it('records a non-negative durationMs', () => {
        expect.hasAssertions();
        new OrderService().placeOrderSync('sku-42', 3);
        const observations = transport.snapshot();
        expect(typeof observations[0].durationMs).toBe('number');
        expect(observations[0].durationMs >= 0).toBe(true);
    });

    it('records labels on the error path when a labelled Promise rejects', async () => {
        expect.hasAssertions();
        await expect(new OrderService().refundOrder('ord-99')).rejects.toThrow('refund failed');
        expect(transport.snapshot()[0]).toMatchObject({ name: 'order_refund_ms', labels: { orderId: 'ord-99' } });
    });

    it('records one observation when a sync method throws', () => {
        expect.hasAssertions();
        expect(() => new OrderService().submitOrder()).toThrow('out of stock');
        expect(transport.snapshot()).toHaveLength(1);
    });

    it('passes extra strategies through to the engine', () => {
        expect.hasAssertions();
        new OrderService().cancelOrder('ord-42');
        expect(transport.snapshot()).toHaveLength(1);
    });
});
