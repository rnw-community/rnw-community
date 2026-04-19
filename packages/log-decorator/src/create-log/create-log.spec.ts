import { beforeEach, describe, expect, it, jest } from '@jest/globals';

import { createLog } from './create-log';

import type { LogTransportInterface } from '../interface/log-transport.interface';

const transportLog = jest.fn<LogTransportInterface['log']>();
const transportDebug = jest.fn<LogTransportInterface['debug']>();
const transportError = jest.fn<LogTransportInterface['error']>();
const transport: LogTransportInterface = { log: transportLog, debug: transportDebug, error: transportError };

const LegacyLog = createLog({ transport });

class OrderService {
    @(LegacyLog<[string, number], string>(
        (productId, qty) => `placing order ${productId} qty=${qty.toString()}`,
        (receiptId, productId, qty) => `placed ${productId} qty=${qty.toString()} -> ${receiptId}`
    ))
    async placeOrder(productId: string, qty: number): Promise<string> {
        return `receipt-${productId}-${qty.toString()}`;
    }

    @(LegacyLog('submitting order'))
    submitOrder(_sku: string): void {
        void 0;
    }

    @(LegacyLog())
    listOrders(): void {
        void 0;
    }

    @(LegacyLog<[], string>(undefined, 'receipt fetched'))
    fetchReceipt(): string {
        return 'receipt-001';
    }

    @(LegacyLog<[string], string>(undefined, (receiptId, orderId) => `fetched ${receiptId} for order ${orderId}`))
    fetchReceiptFn(orderId: string): string {
        return `receipt-${orderId}`;
    }

    @(LegacyLog<[], void>(undefined, undefined, 'refund failed'))
    refundOrder(): void {
        throw new Error('insufficient balance');
    }

    @(LegacyLog<[], void>(undefined, undefined, 'refund failed'))
    refundOrderNonError(): void {
        throw (42 as unknown);
    }

    @(LegacyLog<[string], void>(undefined, undefined, (error, orderId) => `refund failed for ${orderId}: ${String(error)}`))
    refundOrderFn(orderId: string): void {
        throw new Error(`insufficient balance for ${orderId}`);
    }

    @(LegacyLog<[string], void>(undefined, undefined, (error, orderId) => `refund failed for ${orderId}: ${String(error)}`))
    refundOrderFnNonError(_orderId: string): void {
        throw ('non-error-value' as unknown);
    }

    @(LegacyLog())
    dispatchOrder(): void {
        throw new Error('dispatch unavailable');
    }

    @(LegacyLog<[], number>(undefined, 'order resolved'))
    async resolveOrderAsync(): Promise<number> {
        return 42;
    }

    @(LegacyLog<[], void>(undefined, undefined, 'async order failed'))
    async rejectOrderAsync(): Promise<void> {
        throw new Error('async-fail');
    }
}

describe('createLog (experimentalDecorators)', () => {
    beforeEach(() => {
        transportLog.mockReset();
        transportDebug.mockReset();
        transportError.mockReset();
    });

    describe('preLog', () => {
        it('logs string preLog to transport.log with method context', () => {
            expect.hasAssertions();
            new OrderService().submitOrder('sku-99');
            expect(transportLog).toHaveBeenCalledWith('submitting order', 'OrderService::submitOrder');
        });

        it('logs function preLog with typed method args', async () => {
            expect.hasAssertions();
            await new OrderService().placeOrder('sku-42', 3);
            expect(transportLog).toHaveBeenCalledWith('placing order sku-42 qty=3', 'OrderService::placeOrder');
        });

        it('does not call transport.log when preLog is omitted', () => {
            expect.hasAssertions();
            new OrderService().listOrders();
            expect(transportLog).not.toHaveBeenCalled();
        });
    });

    describe('postLog', () => {
        it('logs string postLog to transport.debug after success', () => {
            expect.hasAssertions();
            new OrderService().fetchReceipt();
            expect(transportDebug).toHaveBeenCalledWith('receipt fetched', 'OrderService::fetchReceipt');
        });

        it('logs function postLog with result and typed args', () => {
            expect.hasAssertions();
            new OrderService().fetchReceiptFn('order-7');
            expect(transportDebug).toHaveBeenCalledWith(
                'fetched receipt-order-7 for order order-7',
                'OrderService::fetchReceiptFn'
            );
        });

        it('does not call transport.debug when postLog is omitted', () => {
            expect.hasAssertions();
            new OrderService().listOrders();
            expect(transportDebug).not.toHaveBeenCalled();
        });
    });

    describe('errorLog', () => {
        it('logs string errorLog to transport.error with Error instance as second arg', () => {
            expect.hasAssertions();
            expect(() => { new OrderService().refundOrder(); }).toThrow('insufficient balance');
            expect(transportError).toHaveBeenCalledWith('refund failed', expect.any(Error), 'OrderService::refundOrder');
        });

        it('logs string errorLog with undefined as second arg when throw is not an Error', () => {
            expect.hasAssertions();
            expect(() => { new OrderService().refundOrderNonError(); }).toThrow();
            expect(transportError).toHaveBeenCalledWith('refund failed', undefined, 'OrderService::refundOrderNonError');
        });

        it('logs function errorLog with Error instance and typed args', () => {
            expect.hasAssertions();
            expect(() => { new OrderService().refundOrderFn('order-5'); }).toThrow('insufficient balance for order-5');
            expect(transportError).toHaveBeenCalledWith(
                'refund failed for order-5: Error: insufficient balance for order-5',
                expect.any(Error),
                'OrderService::refundOrderFn'
            );
        });

        it('logs function errorLog with undefined as second arg when throw is not an Error', () => {
            expect.hasAssertions();
            expect(() => { new OrderService().refundOrderFnNonError('order-9'); }).toThrow('non-error-value');
            expect(transportError).toHaveBeenCalledWith(
                'refund failed for order-9: non-error-value',
                undefined,
                'OrderService::refundOrderFnNonError'
            );
        });

        it('does not call transport.error when errorLog is omitted', () => {
            expect.hasAssertions();
            expect(() => { new OrderService().dispatchOrder(); }).toThrow('dispatch unavailable');
            expect(transportError).not.toHaveBeenCalled();
        });
    });

    describe('async methods (Promise)', () => {
        it('calls postLog after promise resolves', async () => {
            expect.hasAssertions();
            await new OrderService().resolveOrderAsync();
            expect(transportDebug).toHaveBeenCalledWith('order resolved', 'OrderService::resolveOrderAsync');
        });

        it('calls errorLog after promise rejects', async () => {
            expect.hasAssertions();
            await expect(new OrderService().rejectOrderAsync()).rejects.toThrow('async-fail');
            expect(transportError).toHaveBeenCalledWith('async order failed', expect.any(Error), 'OrderService::rejectOrderAsync');
        });
    });
});
