import { describe, expect, it, jest } from '@jest/globals';

import { inMemoryHistogramTransport } from '../transport/in-memory-histogram-transport';

import { createLegacyHistogramMetric } from './create-legacy-histogram-metric';

import type { HistogramTransportInterface } from '../interface/histogram-transport.interface';

const makeTransportMock = (): jest.Mocked<HistogramTransportInterface> => ({
    observe: jest.fn(),
});

const applyLegacyDecorator = (
    proto: object,
    methodName: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    decoratorFn: (target: object, propertyKey: string, descriptor: TypedPropertyDescriptor<any>) => TypedPropertyDescriptor<any>
): void => {
    const descriptor = Object.getOwnPropertyDescriptor(proto, methodName) as PropertyDescriptor;
    Object.defineProperty(proto, methodName, decoratorFn(proto, methodName, descriptor as never));
};

describe('createLegacyHistogramMetric', () => {
    it('derives default name from className + methodName', () => {
        expect.assertions(2);
        const transport = makeTransportMock();
        const decorator = createLegacyHistogramMetric({ transport })();

        class LegacyService {
             
            doWork() {
                return 1;
            }
        }
        applyLegacyDecorator(LegacyService.prototype as object, 'doWork', decorator);
        new LegacyService().doWork();

        expect(transport.observe).toHaveBeenCalledTimes(1);
        expect((transport.observe as jest.Mock).mock.calls[0]?.[0]).toBe('LegacyService_doWork_duration_ms');
    });

    it('uses the supplied custom name', () => {
        expect.assertions(1);
        const transport = makeTransportMock();
        const decorator = createLegacyHistogramMetric({ transport })({ name: 'my_custom_ms' });

        class Svc {
             
            work() {
                return 'done';
            }
        }
        applyLegacyDecorator(Svc.prototype as object, 'work', decorator);
        new Svc().work();

        expect((transport.observe as jest.Mock).mock.calls[0]?.[0]).toBe('my_custom_ms');
    });

    it('passes static labels to transport', () => {
        expect.assertions(1);
        const transport = makeTransportMock();
        const decorator = createLegacyHistogramMetric({ transport })({
            labels: () => ({ service: 'checkout' }),
        });

        class Svc {
             
            ping() {
                return 'ok';
            }
        }
        applyLegacyDecorator(Svc.prototype as object, 'ping', decorator);
        new Svc().ping();

        expect((transport.observe as jest.Mock).mock.calls[0]?.[2]).toEqual({ service: 'checkout' });
    });

    it('calls label factory with method args', () => {
        expect.assertions(2);
        const transport = makeTransportMock();
        const labelFn = jest.fn(([userId]: readonly [string]) => ({ userId }));
        const decorator = createLegacyHistogramMetric({ transport })({ labels: labelFn });

        class Svc {
             
            fetch(_userId: string) {
                return 'found';
            }
        }
        applyLegacyDecorator(Svc.prototype as object, 'fetch', decorator);
        new Svc().fetch('user-7');

        expect(labelFn).toHaveBeenCalledWith(['user-7']);
        expect((transport.observe as jest.Mock).mock.calls[0]?.[2]).toEqual({ userId: 'user-7' });
    });

    it('emits observation on sync success', () => {
        expect.assertions(3);
        const transport = makeTransportMock();
        const decorator = createLegacyHistogramMetric({ transport })();

        class Svc {
             
            compute() {
                return 'result';
            }
        }
        applyLegacyDecorator(Svc.prototype as object, 'compute', decorator);
        const out = new Svc().compute();

        expect(out).toBe('result');
        expect(transport.observe).toHaveBeenCalledTimes(1);
        expect(typeof (transport.observe as jest.Mock).mock.calls[0]?.[1]).toBe('number');
    });

    it('emits observation on sync error (and rethrows)', () => {
        expect.assertions(3);
        const transport = makeTransportMock();
        const decorator = createLegacyHistogramMetric({ transport })();
        const boom = new Error('legacy-sync-error');

        class Svc {
            fail(): never {
                throw boom;
            }
        }
        applyLegacyDecorator(Svc.prototype as object, 'fail', decorator);

        expect(() => new Svc().fail()).toThrow(boom);
        expect(transport.observe).toHaveBeenCalledTimes(1);
        expect(typeof (transport.observe as jest.Mock).mock.calls[0]?.[1]).toBe('number');
    });

    it('emits observation after Promise resolves', async () => {
        expect.assertions(3);
        const transport = makeTransportMock();
        const decorator = createLegacyHistogramMetric({ transport })();

        class Svc {
             
            async asyncWork() {
                await new Promise<void>((resolve) => {
                    setTimeout(resolve, 1);
                });

                return 42;
            }
        }
        applyLegacyDecorator(Svc.prototype as object, 'asyncWork', decorator);
        const out = await new Svc().asyncWork();

        expect(out).toBe(42);
        expect(transport.observe).toHaveBeenCalledTimes(1);
        expect(typeof (transport.observe as jest.Mock).mock.calls[0]?.[1]).toBe('number');
    });

    it('emits observation after Promise rejects (and rethrows)', async () => {
        expect.assertions(3);
        const transport = makeTransportMock();
        const decorator = createLegacyHistogramMetric({ transport })();
        const boom = new Error('legacy-async-error');

        class Svc {
             
            async asyncFail() {
                await new Promise<void>((resolve) => {
                    setTimeout(resolve, 1);
                });
                throw boom;
            }
        }
        applyLegacyDecorator(Svc.prototype as object, 'asyncFail', decorator);

        await expect(new Svc().asyncFail()).rejects.toBe(boom);
        expect(transport.observe).toHaveBeenCalledTimes(1);
        expect(typeof (transport.observe as jest.Mock).mock.calls[0]?.[1]).toBe('number');
    });

    it('works with no config argument (undefined config)', () => {
        expect.assertions(1);
        const transport = makeTransportMock();
        const decorator = createLegacyHistogramMetric({ transport })();

        class Svc {
             
            noop() {
                return undefined;
            }
        }
        applyLegacyDecorator(Svc.prototype as object, 'noop', decorator);
        new Svc().noop();

        expect(transport.observe).toHaveBeenCalledTimes(1);
    });

    it('passes extra strategies through to the engine', () => {
        expect.assertions(1);
        const transport = makeTransportMock();
        const nonMatchingStrategy = {
            matches: () => false,
            handle: <T>(value: T): T => value,
        };
        const decorator = createLegacyHistogramMetric({ transport, strategies: [nonMatchingStrategy] })();

        class Svc {
             
            run() {
                return 7;
            }
        }
        applyLegacyDecorator(Svc.prototype as object, 'run', decorator);
        new Svc().run();

        expect(transport.observe).toHaveBeenCalledTimes(1);
    });

    it('round-trip with inMemoryHistogramTransport', () => {
        expect.assertions(4);
        const transport = inMemoryHistogramTransport();
        const decorator = createLegacyHistogramMetric({ transport })({
            name: 'roundtrip_ms',
            labels: () => ({ env: 'test' }),
        });

        class Svc {
             
            process() {
                return 'done';
            }
        }
        applyLegacyDecorator(Svc.prototype as object, 'process', decorator);
        new Svc().process();

        const snap = transport.snapshot();
        expect(snap).toHaveLength(1);
        expect(snap[0]?.name).toBe('roundtrip_ms');
        expect(typeof snap[0]?.durationMs).toBe('number');
        expect(snap[0]?.labels).toEqual({ env: 'test' });
    });
});
