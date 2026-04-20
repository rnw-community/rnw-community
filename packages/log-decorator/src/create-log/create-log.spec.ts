import { beforeEach, describe, expect, it, jest } from '@jest/globals';

import { createLog } from './create-log';

import type { LogTransportInterface } from '../interface/log-transport.interface';

const transportLog = jest.fn<LogTransportInterface['log']>();
const transportDebug = jest.fn<LogTransportInterface['debug']>();
const transportError = jest.fn<LogTransportInterface['error']>();
const transport: LogTransportInterface = { log: transportLog, debug: transportDebug, error: transportError };

const Log = createLog({ transport });

class OrderService {
    @Log(
        (productId: string, qty: number) => `placing order ${productId} qty=${qty.toString()}`,
        (receiptId: string, productId: string, qty: number) =>
            `placed ${productId} qty=${qty.toString()} -> ${receiptId}`
    )
    async placeOrder(productId: string, qty: number): Promise<string> {
        return `receipt-${productId}-${qty.toString()}`;
    }

    @Log('submitting order')
    submitOrder(_sku: string): void {
        void 0;
    }

    @Log()
    listOrders(): void {
        void 0;
    }

    @Log(undefined, 'receipt fetched')
    fetchReceipt(): string {
        return 'receipt-001';
    }

    @Log(undefined, (receiptId: string, orderId: string) => `fetched ${receiptId} for order ${orderId}`)
    fetchReceiptFn(orderId: string): string {
        return `receipt-${orderId}`;
    }

    @Log(undefined, undefined, 'refund failed')
    refundOrder(): void {
        throw new Error('insufficient balance');
    }

    @Log(undefined, undefined, 'refund failed')
    refundOrderNonError(): void {
        throw (42 as unknown);
    }

    @Log(undefined, undefined, (error: unknown, orderId: string) => `refund failed for ${orderId}: ${String(error)}`)
    refundOrderFn(orderId: string): void {
        throw new Error(`insufficient balance for ${orderId}`);
    }

    @Log(undefined, undefined, (error: unknown, orderId: string) => `refund failed for ${orderId}: ${String(error)}`)
    refundOrderFnNonError(_orderId: string): void {
        throw ('non-error-value' as unknown);
    }

    @Log()
    dispatchOrder(): void {
        throw new Error('dispatch unavailable');
    }

    @Log(undefined, 'order resolved')
    async resolveOrderAsync(): Promise<number> {
        return 42;
    }

    @Log(undefined, undefined, 'async order failed')
    async rejectOrderAsync(): Promise<void> {
        throw new Error('async-fail');
    }

    @Log('')
    quietPreLog(): void {
        void 0;
    }

    @Log(() => '')
    quietPreLogFn(): void {
        void 0;
    }

    @Log(undefined, '')
    quietPostLog(): string {
        return 'ok';
    }

    @Log(undefined, () => '')
    quietPostLogFn(): string {
        return 'ok';
    }

    @Log(undefined, undefined, '')
    quietErrorLog(): void {
        throw new Error('boom');
    }

    @Log(undefined, undefined, () => '')
    quietErrorLogFn(): void {
        throw new Error('boom');
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

    describe('empty-string hooks are skipped', () => {
        it('does not call transport.log when string preLog is empty', () => {
            expect.hasAssertions();
            new OrderService().quietPreLog();
            expect(transportLog).not.toHaveBeenCalled();
        });

        it('does not call transport.log when function preLog returns empty', () => {
            expect.hasAssertions();
            new OrderService().quietPreLogFn();
            expect(transportLog).not.toHaveBeenCalled();
        });

        it('does not call transport.debug when string postLog is empty', () => {
            expect.hasAssertions();
            new OrderService().quietPostLog();
            expect(transportDebug).not.toHaveBeenCalled();
        });

        it('does not call transport.debug when function postLog returns empty', () => {
            expect.hasAssertions();
            new OrderService().quietPostLogFn();
            expect(transportDebug).not.toHaveBeenCalled();
        });

        it('does not call transport.error when string errorLog is empty', () => {
            expect.hasAssertions();
            expect(() => { new OrderService().quietErrorLog(); }).toThrow('boom');
            expect(transportError).not.toHaveBeenCalled();
        });

        it('does not call transport.error when function errorLog returns empty', () => {
            expect.hasAssertions();
            expect(() => { new OrderService().quietErrorLogFn(); }).toThrow('boom');
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
