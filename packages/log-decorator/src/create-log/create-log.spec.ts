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

    describe('callback type narrowing (compile-time + runtime)', () => {
        // Each test in this block would FAIL to type-check if TArgs/TResult narrowing
        // broke: the callback bodies invoke type-specific methods (.toUpperCase,
        // .toFixed, .getTime, etc.) that only exist on the annotated type. If inference
        // silently fell back to `unknown`, these calls would be TS errors and this
        // suite would fail `yarn ts` before it ever ran.

        it('narrows a string param: `.toUpperCase()` / `.slice()` on the inferred type', () => {
            expect.hasAssertions();

            class StringNarrow {
                @Log((productId: string) => `enter ${productId.toUpperCase().slice(0, 6)}`)
                run(productId: string): void {
                    void productId;
                }
            }

            new StringNarrow().run('sku-42-abc');
            expect(transportLog).toHaveBeenCalledWith('enter SKU-42', 'StringNarrow::run');
        });

        it('narrows a number param: `.toFixed()` / arithmetic on the inferred type', () => {
            expect.hasAssertions();

            class NumberNarrow {
                @Log((qty: number) => `qty=${qty.toFixed(2)} doubled=${(qty * 2).toString()}`)
                run(qty: number): void {
                    void qty;
                }
            }

            const pi = 3.14159;
            new NumberNarrow().run(pi);
            expect(transportLog).toHaveBeenCalledWith('qty=3.14 doubled=6.28318', 'NumberNarrow::run');
        });

        it('narrows a boolean param: ternary over the inferred type', () => {
            expect.hasAssertions();

            class BoolNarrow {
                @Log((active: boolean) => (active ? 'on' : 'off'))
                run(active: boolean): void {
                    void active;
                }
            }

            new BoolNarrow().run(true);
            expect(transportLog).toHaveBeenCalledWith('on', 'BoolNarrow::run');
        });

        it('narrows a Date param: `.getTime()` on the inferred type', () => {
            expect.hasAssertions();

            class DateNarrow {
                @Log((at: Date) => `ts=${at.getTime().toString()}`)
                run(at: Date): void {
                    void at;
                }
            }

            const fixedEpochMs = 1_700_000_000_000;
            new DateNarrow().run(new Date(fixedEpochMs));
            expect(transportLog).toHaveBeenCalledWith('ts=1700000000000', 'DateNarrow::run');
        });

        it('narrows a heterogeneous arg tuple: string + number + object destructuring', () => {
            expect.hasAssertions();

            class MixedNarrow {
                @Log((id: string, qty: number, { sku }: { sku: string }) =>
                    `${id.toUpperCase()}:${qty.toFixed(0)}:${sku.padStart(4, '0')}`)
                run(id: string, qty: number, item: { sku: string }): void {
                    void id; void qty; void item;
                }
            }

            new MixedNarrow().run('ord-1', 3, { sku: '7' });
            expect(transportLog).toHaveBeenCalledWith('ORD-1:3:0007', 'MixedNarrow::run');
        });

        it('narrows the postLog `result` param: number-specific methods on the inferred TResult', () => {
            expect.hasAssertions();

            class PostNumberNarrow {
                @Log(undefined, (result: number, input: number) =>
                    `${result.toFixed(2)} from ${input.toFixed(2)}`)
                compute(input: number): number {
                    return input * 2;
                }
            }

            new PostNumberNarrow().compute(1.5);
            expect(transportDebug).toHaveBeenCalledWith('3.00 from 1.50', 'PostNumberNarrow::compute');
        });

        it('narrows the postLog `result` param: string-specific methods on the inferred TResult', () => {
            expect.hasAssertions();

            class PostStringNarrow {
                @Log(undefined, (result: string, id: string) => `${result.toUpperCase()} (${id.length.toString()})`)
                describe(id: string): string {
                    return `receipt-${id}`;
                }
            }

            new PostStringNarrow().describe('abc');
            expect(transportDebug).toHaveBeenCalledWith('RECEIPT-ABC (3)', 'PostStringNarrow::describe');
        });

        it('narrows the postLog result over Promise methods: TResult is the awaited value, not the Promise', async () => {
            expect.hasAssertions();

            class PromiseNarrow {
                @Log(undefined, (result: { readonly total: number }, _label: string) =>
                    `paid=${result.total.toFixed(2)}`)
                async pay(_label: string): Promise<{ readonly total: number }> {
                    return { total: 42.5 };
                }
            }

            await new PromiseNarrow().pay('invoice-1');
            expect(transportDebug).toHaveBeenCalledWith('paid=42.50', 'PromiseNarrow::pay');
        });

        it('errorLog `error` is deliberately `unknown` — requires a guard before typed access', () => {
            expect.hasAssertions();

            class ErrorNarrow {
                @Log(undefined, undefined, (error: unknown, id: string) =>
                    `${id.toUpperCase()}: ${error instanceof Error ? error.message.toLowerCase() : String(error)}`)
                fail(id: string): void {
                    throw new Error(`BOOM-${id}`);
                }
            }

            expect(() => { new ErrorNarrow().fail('ord-9'); }).toThrow('BOOM-ord-9');
            expect(transportError).toHaveBeenCalledWith(
                'ORD-9: boom-ord-9',
                expect.any(Error),
                'ErrorNarrow::fail'
            );
        });

        it('rejects mismatched callback annotations at compile time (number-op on string-annotated param)', () => {
            expect.hasAssertions();

            class NegativeNumberOnString {
                // @ts-expect-error — .toFixed() does not exist on string; would surface if narrowing broke
                // eslint-disable-next-line @typescript-eslint/no-unsafe-call
                @Log((id: string) => id.toFixed(2))
                run(id: string): void {
                    void id;
                }
            }

            expect(NegativeNumberOnString).toBeDefined();
        });

        it('rejects mismatched callback annotations at compile time (string-op on number-annotated param)', () => {
            expect.hasAssertions();

            class NegativeStringOnNumber {
                // @ts-expect-error — .toUpperCase() does not exist on number; would surface if narrowing broke
                // eslint-disable-next-line @typescript-eslint/no-unsafe-call
                @Log((qty: number) => qty.toUpperCase())
                run(qty: number): void {
                    void qty;
                }
            }

            expect(NegativeStringOnNumber).toBeDefined();
        });

        it('rejects mismatched postLog `result` annotation at compile time', () => {
            expect.hasAssertions();

            class NegativeResultMismatch {
                // @ts-expect-error — result annotated as string but .toFixed() is a number method
                // eslint-disable-next-line @typescript-eslint/no-unsafe-call
                @Log(undefined, (result: string) => result.toFixed(2))
                run(): string {
                    return 'ok';
                }
            }

            expect(NegativeResultMismatch).toBeDefined();
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
