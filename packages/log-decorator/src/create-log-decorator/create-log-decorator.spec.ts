import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { Observable, lastValueFrom, of, throwError } from 'rxjs';

import { createLogDecorator } from './create-log-decorator';

import type { LogTransportInterface } from '../interface/log-transport.interface';

const transportLog = jest.fn<LogTransportInterface['log']>();
const transportDebug = jest.fn<LogTransportInterface['debug']>();
const transportError = jest.fn<LogTransportInterface['error']>();
const transport: LogTransportInterface = { log: transportLog, debug: transportDebug, error: transportError };
const PI = 3.14159;
const FIXED_EPOCH_MS = 1_700_000_000_000;

const Log = createLogDecorator({ transport });
const Log$ = Log;

class OrderService {
    @Log(
        (productId, qty) => `placing order ${productId} qty=${qty.toString()}`,
        (receiptId, _durationMs, productId, qty) => `placed ${productId} qty=${qty.toString()} -> ${receiptId}`
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

    @Log(undefined, (receiptId, _durationMs, orderId) => `fetched ${receiptId} for order ${orderId}`)
    fetchReceiptFn(orderId: string): string {
        return `receipt-${orderId}`;
    }

    @Log(undefined, undefined, 'refund failed')
    refundOrder(): void {
        throw new Error('insufficient balance');
    }

    @Log(undefined, undefined, 'refund failed')
    refundOrderNonError(): void {
        throw 42 as unknown;
    }

    @Log(undefined, undefined, (error, _durationMs, orderId) => `refund failed for ${orderId}: ${String(error)}`)
    refundOrderFn(orderId: string): void {
        throw new Error(`insufficient balance for ${orderId}`);
    }

    @Log(undefined, undefined, (error, _durationMs, orderId) => `refund failed for ${orderId}: ${String(error)}`)
    refundOrderFnNonError(_orderId: string): void {
        throw 'non-error-value' as unknown;
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

describe('createLogDecorator (experimentalDecorators)', () => {
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
            expect(() => {
                new OrderService().refundOrder();
            }).toThrow('insufficient balance');
            expect(transportError).toHaveBeenCalledWith('refund failed', expect.any(Error), 'OrderService::refundOrder');
        });

        it('logs string errorLog with undefined as second arg when throw is not an Error', () => {
            expect.hasAssertions();
            expect(() => {
                new OrderService().refundOrderNonError();
            }).toThrow();
            expect(transportError).toHaveBeenCalledWith('refund failed', undefined, 'OrderService::refundOrderNonError');
        });

        it('logs function errorLog with Error instance and typed args', () => {
            expect.hasAssertions();
            expect(() => {
                new OrderService().refundOrderFn('order-5');
            }).toThrow('insufficient balance for order-5');
            expect(transportError).toHaveBeenCalledWith(
                'refund failed for order-5: Error: insufficient balance for order-5',
                expect.any(Error),
                'OrderService::refundOrderFn'
            );
        });

        it('logs function errorLog with undefined as second arg when throw is not an Error', () => {
            expect.hasAssertions();
            expect(() => {
                new OrderService().refundOrderFnNonError('order-9');
            }).toThrow('non-error-value');
            expect(transportError).toHaveBeenCalledWith(
                'refund failed for order-9: non-error-value',
                undefined,
                'OrderService::refundOrderFnNonError'
            );
        });

        it('does not call transport.error when errorLog is omitted', () => {
            expect.hasAssertions();
            expect(() => {
                new OrderService().dispatchOrder();
            }).toThrow('dispatch unavailable');
            expect(transportError).not.toHaveBeenCalled();
        });
    });

    describe('automatic type narrowing from the decorated method signature', () => {
        it('narrows a string arg without annotation', () => {
            expect.hasAssertions();

            class StringNarrow {
                @Log(productId => `enter ${productId.toUpperCase().slice(0, 6)}`)
                run(productId: string): void {
                    void productId;
                }
            }

            new StringNarrow().run('sku-42-abc');
            expect(transportLog).toHaveBeenCalledWith('enter SKU-42', 'StringNarrow::run');
        });

        it('narrows a number arg without annotation', () => {
            expect.hasAssertions();

            class NumberNarrow {
                @Log(qty => `qty=${qty.toFixed(2)} doubled=${(qty * 2).toString()}`)
                run(qty: number): void {
                    void qty;
                }
            }

            new NumberNarrow().run(PI);
            expect(transportLog).toHaveBeenCalledWith('qty=3.14 doubled=6.28318', 'NumberNarrow::run');
        });

        it('narrows a boolean arg without annotation', () => {
            expect.hasAssertions();

            class BoolNarrow {
                @Log(active => (active ? 'on' : 'off'))
                run(active: boolean): void {
                    void active;
                }
            }

            new BoolNarrow().run(true);
            expect(transportLog).toHaveBeenCalledWith('on', 'BoolNarrow::run');
        });

        it('narrows a Date arg without annotation', () => {
            expect.hasAssertions();

            class DateNarrow {
                @Log(at => `ts=${at.getTime().toString()}`)
                run(at: Date): void {
                    void at;
                }
            }

            new DateNarrow().run(new Date(FIXED_EPOCH_MS));
            expect(transportLog).toHaveBeenCalledWith('ts=1700000000000', 'DateNarrow::run');
        });

        it('narrows a heterogeneous arg tuple with destructuring and no annotation', () => {
            expect.hasAssertions();

            class MixedNarrow {
                @Log((id, qty, { sku }) => `${id.toUpperCase()}:${qty.toFixed(0)}:${sku.padStart(4, '0')}`)
                run(id: string, qty: number, item: { sku: string }): void {
                    void id;
                    void qty;
                    void item;
                }
            }

            new MixedNarrow().run('ord-1', 3, { sku: '7' });
            expect(transportLog).toHaveBeenCalledWith('ORD-1:3:0007', 'MixedNarrow::run');
        });

        it('narrows postLog result from a sync number-returning method', () => {
            expect.hasAssertions();

            class PostNumberNarrow {
                @Log(undefined, (result, _durationMs, input) => `${result.toFixed(2)} from ${input.toFixed(2)}`)
                compute(input: number): number {
                    return input * 2;
                }
            }

            new PostNumberNarrow().compute(1.5);
            expect(transportDebug).toHaveBeenCalledWith('3.00 from 1.50', 'PostNumberNarrow::compute');
        });

        it('narrows postLog result from a sync string-returning method', () => {
            expect.hasAssertions();

            class PostStringNarrow {
                @Log(undefined, (result, _durationMs, id) => `${result.toUpperCase()} (${id.length.toString()})`)
                describe(id: string): string {
                    return `receipt-${id}`;
                }
            }

            new PostStringNarrow().describe('abc');
            expect(transportDebug).toHaveBeenCalledWith('RECEIPT-ABC (3)', 'PostStringNarrow::describe');
        });

        it('narrows postLog result over a Promise-returning method (TResult is awaited)', async () => {
            expect.hasAssertions();

            class PromiseNarrow {
                @Log(undefined, (result, _durationMs, _label) => `paid=${result.total.toFixed(2)}`)
                async pay(_label: string): Promise<{ readonly total: number }> {
                    return { total: 42.5 };
                }
            }

            await new PromiseNarrow().pay('invoice-1');
            expect(transportDebug).toHaveBeenCalledWith('paid=42.50', 'PromiseNarrow::pay');
        });

        it('narrows postLog result over an Observable-returning method (TResult is emitted value)', async () => {
            expect.hasAssertions();

            class ObservableNarrow {
                @Log$(undefined, (result, _durationMs, _label) => `tick=${result.count.toFixed(0)}`)
                stream$(_label: string): Observable<{ readonly count: number }> {
                    return of({ count: 7 });
                }
            }

            await lastValueFrom(new ObservableNarrow().stream$('feed'));
            expect(transportDebug).toHaveBeenCalledWith('tick=7', 'ObservableNarrow::stream$');
        });

        it('narrows errorLog typed args from the method signature (error stays unknown by design)', () => {
            expect.hasAssertions();

            class ErrorNarrow {
                @Log(undefined, undefined, (error, _durationMs, id) =>
                    `${id.toUpperCase()}: ${error instanceof Error ? error.message.toLowerCase() : String(error)}`)
                fail(id: string): void {
                    throw new Error(`BOOM-${id}`);
                }
            }

            expect(() => {
                new ErrorNarrow().fail('ord-9');
            }).toThrow('BOOM-ord-9');
            expect(transportError).toHaveBeenCalledWith('ORD-9: boom-ord-9', expect.any(Error), 'ErrorNarrow::fail');
        });

        it('assigns inferred arg to a matching-type local without a cast (narrowing sentinel)', () => {
            expect.hasAssertions();

            class NarrowingActive {
                @Log(id => {
                    const asString: string = id;

                    return asString.toUpperCase();
                })
                run(id: string): void {
                    void id;
                }
            }

            new NarrowingActive().run('hello');
            expect(transportLog).toHaveBeenCalledWith('HELLO', 'NarrowingActive::run');
        });

        it('assigns inferred result to a matching-type local without a cast (TResult sentinel)', () => {
            expect.hasAssertions();

            class ResultNarrowingActive {
                @Log(undefined, result => {
                    const asNumber: number = result;

                    return asNumber.toFixed(1);
                })
                compute(): number {
                    return PI;
                }
            }

            new ResultNarrowingActive().compute();
            expect(transportDebug).toHaveBeenCalledWith('3.1', 'ResultNarrowingActive::compute');
        });
    });

    describe('unification: one decorator handles sync, Promise, and Observable on the same class', () => {
        it('same @Log$ fires correct hooks for every return shape without any per-method configuration', async () => {
            expect.hasAssertions();

            class Unified {
                @Log$(
                    (id, qty) => `sync:${id}:${qty.toString()}`,
                    (result, _durationMs, id, qty) => `sync-ok:${id}:${qty.toString()}=${result.toUpperCase()}`
                )
                syncMethod(id: string, qty: number): string {
                    return `${id}-${qty.toString()}`;
                }

                @Log$(
                    id => `promise:${id}`,
                    (result, _durationMs, id) => `promise-ok:${id}=${result.total.toFixed(2)}`
                )
                async promiseMethod(_id: string): Promise<{ readonly total: number }> {
                    return { total: 9.99 };
                }

                @Log$(
                    label => `stream:${label}`,
                    (tick, _durationMs, label) => `stream-ok:${label}=${tick.toFixed(0)}`
                )
                streamMethod(_label: string): Observable<number> {
                    return of(42);
                }
            }

            const svc = new Unified();

            svc.syncMethod('sku', 3);
            expect(transportLog).toHaveBeenCalledWith('sync:sku:3', 'Unified::syncMethod');
            expect(transportDebug).toHaveBeenCalledWith('sync-ok:sku:3=SKU-3', 'Unified::syncMethod');

            await svc.promiseMethod('ord-1');
            expect(transportLog).toHaveBeenCalledWith('promise:ord-1', 'Unified::promiseMethod');
            expect(transportDebug).toHaveBeenCalledWith('promise-ok:ord-1=9.99', 'Unified::promiseMethod');

            await lastValueFrom(svc.streamMethod('feed'));
            expect(transportLog).toHaveBeenCalledWith('stream:feed', 'Unified::streamMethod');
            expect(transportDebug).toHaveBeenCalledWith('stream-ok:feed=42', 'Unified::streamMethod');
        });
    });

    describe('Observable methods (via observableStrategy)', () => {
        it('emits preLog on subscribe and postLog on each emitted value', async () => {
            expect.hasAssertions();

            class StreamService {
                @Log$(
                    label => `subscribe ${label.toUpperCase()}`,
                    (tick, _durationMs, label) => `${label}=${tick.toFixed(0)}`
                )
                stream$(_label: string): Observable<number> {
                    return of(1, 2, 3);
                }
            }

            await lastValueFrom(new StreamService().stream$('feed'));
            expect(transportLog).toHaveBeenCalledWith('subscribe FEED', 'StreamService::stream$');
            expect(transportDebug).toHaveBeenNthCalledWith(1, 'feed=1', 'StreamService::stream$');
            expect(transportDebug).toHaveBeenNthCalledWith(2, 'feed=2', 'StreamService::stream$');
            expect(transportDebug).toHaveBeenNthCalledWith(3, 'feed=3', 'StreamService::stream$');
        });

        it('emits errorLog when the Observable errors', async () => {
            expect.hasAssertions();

            class StreamService {
                @Log$(undefined, undefined, (error, _durationMs, label) => `${label}-fail: ${String(error)}`)
                stream$(label: string): Observable<number> {
                    return throwError(() => new Error(`stream-boom-${label}`));
                }
            }

            await expect(lastValueFrom(new StreamService().stream$('feed'))).rejects.toThrow('stream-boom-feed');
            expect(transportError).toHaveBeenCalledWith(
                'feed-fail: Error: stream-boom-feed',
                expect.any(Error),
                'StreamService::stream$'
            );
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
            expect(() => {
                new OrderService().quietErrorLog();
            }).toThrow('boom');
            expect(transportError).not.toHaveBeenCalled();
        });

        it('does not call transport.error when function errorLog returns empty', () => {
            expect.hasAssertions();
            expect(() => {
                new OrderService().quietErrorLogFn();
            }).toThrow('boom');
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
            expect(transportError).toHaveBeenCalledWith(
                'async order failed',
                expect.any(Error),
                'OrderService::rejectOrderAsync'
            );
        });
    });

    describe('durationMs threading', () => {
        it('passes a non-negative number as durationMs to postLog callback', () => {
            expect.hasAssertions();
            let captured: number | undefined;

            class Probe {
                @Log(undefined, (_result, durationMs) => {
                    captured = durationMs;

                    return 'seen';
                })
                run(): string {
                    return 'ok';
                }
            }

            new Probe().run();
            expect(typeof captured).toBe('number');
            expect((captured as number) >= 0).toBe(true);
        });

        it('passes a non-negative number as durationMs to errorLog callback', () => {
            expect.hasAssertions();
            let captured: number | undefined;

            class Probe {
                @Log(undefined, undefined, (_error, durationMs) => {
                    captured = durationMs;

                    return 'seen';
                })
                run(): void {
                    throw new Error('boom');
                }
            }

            expect(() => {
                new Probe().run();
            }).toThrow('boom');
            expect(typeof captured).toBe('number');
            expect((captured as number) >= 0).toBe(true);
        });

        it('keeps args after durationMs positionally correct in postLog callback', () => {
            expect.hasAssertions();

            class Probe {
                @Log(undefined, (_result, _durationMs, id, qty) => `id=${id} qty=${qty.toFixed(0)}`)
                run(id: string, qty: number): string {
                    return `${id}-${qty.toString()}`;
                }
            }

            new Probe().run('abc', 7);
            expect(transportDebug).toHaveBeenCalledWith('id=abc qty=7', 'Probe::run');
        });
    });
});
