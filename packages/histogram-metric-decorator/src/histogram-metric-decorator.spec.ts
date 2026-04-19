import { describe, expect, it, jest } from '@jest/globals';

import { createHistogramMetric } from './create-histogram-metric';
import { createLegacyHistogramMetric } from './create-legacy-histogram-metric';
import { inMemoryHistogramTransport } from './in-memory-histogram-transport';
import type { HistogramTransportInterface } from './histogram-transport.interface';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Minimal shim of a TC39 stage-3 ClassMethodDecoratorContext. The engine only
 * reads `context.name`, so this is sufficient for all test scenarios.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const makeStage3Context = <TFn extends (this: unknown, ...args: any) => any>(
    name: string | symbol
): ClassMethodDecoratorContext<unknown, TFn> =>
    ({
        kind: 'method',
        name,
        static: false,
        private: false,
        access: { get: () => undefined as unknown as TFn },
    } as unknown as ClassMethodDecoratorContext<unknown, TFn>);

const makeTransportMock = (): jest.Mocked<HistogramTransportInterface> => ({
    observe: jest.fn(),
});

// ---------------------------------------------------------------------------
// inMemoryHistogramTransport
// ---------------------------------------------------------------------------

describe('inMemoryHistogramTransport', () => {
    it('records observations and returns them from snapshot', () => {
        expect.assertions(3);
        const transport = inMemoryHistogramTransport();

        transport.observe('metric_a', 10);
        transport.observe('metric_b', 20, { env: 'test' });

        const snap = transport.snapshot();
        expect(snap).toHaveLength(2);
        expect(snap[0]).toEqual({ name: 'metric_a', durationMs: 10 });
        expect(snap[1]).toEqual({ name: 'metric_b', durationMs: 20, labels: { env: 'test' } });
    });

    it('clears the store after snapshot', () => {
        expect.assertions(2);
        const transport = inMemoryHistogramTransport();

        transport.observe('x', 1);
        const first = transport.snapshot();
        const second = transport.snapshot();

        expect(first).toHaveLength(1);
        expect(second).toHaveLength(0);
    });

    it('accumulates multiple observations between snapshots', () => {
        expect.assertions(1);
        const transport = inMemoryHistogramTransport();

        transport.observe('m', 5);
        transport.observe('m', 7);
        transport.observe('m', 9);

        expect(transport.snapshot()).toHaveLength(3);
    });
});

// ---------------------------------------------------------------------------
// createHistogramMetric (stage-3)
// ---------------------------------------------------------------------------

describe('createHistogramMetric (stage-3)', () => {
    it('derives default name from className + methodName', () => {
        expect.assertions(2);
        const transport = makeTransportMock();
        const decorator = createHistogramMetric({ transport })();

        const original = function (this: unknown): number {
            return 1;
        };
        const wrapped = decorator(original, makeStage3Context<typeof original>('doWork'));

        class MyService {
            readonly doWork = wrapped;
        }
        new MyService().doWork();

        expect(transport.observe).toHaveBeenCalledTimes(1);
        expect((transport.observe as jest.Mock).mock.calls[0]?.[0]).toBe('MyService_doWork_duration_ms');
    });

    it('uses the supplied custom name instead of auto-derived', () => {
        expect.assertions(1);
        const transport = makeTransportMock();
        const decorator = createHistogramMetric({ transport })({ name: 'custom_metric_ms' });

        const original = function (this: unknown): number {
            return 2;
        };
        const wrapped = decorator(original, makeStage3Context<typeof original>('irrelevant'));

        class Svc {
            readonly irrelevant = wrapped;
        }
        new Svc().irrelevant();

        expect((transport.observe as jest.Mock).mock.calls[0]?.[0]).toBe('custom_metric_ms');
    });

    it('passes static labels to transport', () => {
        expect.assertions(1);
        const transport = makeTransportMock();
        const decorator = createHistogramMetric({ transport })({
            labels: () => ({ region: 'eu-west' }),
        });

        const original = function (this: unknown): string {
            return 'ok';
        };
        const wrapped = decorator(original, makeStage3Context<typeof original>('ping'));

        class Svc {
            readonly ping = wrapped;
        }
        new Svc().ping();

        expect((transport.observe as jest.Mock).mock.calls[0]?.[2]).toEqual({ region: 'eu-west' });
    });

    it('calls label factory with method args', () => {
        expect.assertions(2);
        const transport = makeTransportMock();
        const labelFn = jest.fn(([id]: readonly [string]) => ({ orderId: id }));
        const decorator = createHistogramMetric({ transport })({ labels: labelFn });

        const original = function (this: unknown, _id: string): void {
            // no-op
        };
        const wrapped = decorator(original, makeStage3Context<typeof original>('fetch'));

        class Svc {
            readonly fetch = wrapped;
        }
        new Svc().fetch('order-42');

        expect(labelFn).toHaveBeenCalledWith(['order-42']);
        expect((transport.observe as jest.Mock).mock.calls[0]?.[2]).toEqual({ orderId: 'order-42' });
    });

    it('emits observation on sync success', () => {
        expect.assertions(3);
        const transport = makeTransportMock();
        const decorator = createHistogramMetric({ transport })();

        const original = function (this: unknown): string {
            return 'result';
        };
        const wrapped = decorator(original, makeStage3Context<typeof original>('compute'));

        class Svc {
            readonly compute = wrapped;
        }
        const out = new Svc().compute();

        expect(out).toBe('result');
        expect(transport.observe).toHaveBeenCalledTimes(1);
        expect(typeof (transport.observe as jest.Mock).mock.calls[0]?.[1]).toBe('number');
    });

    it('emits observation on sync error (and rethrows)', () => {
        expect.assertions(3);
        const transport = makeTransportMock();
        const decorator = createHistogramMetric({ transport })();
        const boom = new Error('sync-error');

        const original = function (this: unknown): never {
            throw boom;
        };
        const wrapped = decorator(original, makeStage3Context<typeof original>('fail'));

        class Svc {
            readonly fail = wrapped;
        }

        expect(() => new Svc().fail()).toThrow(boom);
        expect(transport.observe).toHaveBeenCalledTimes(1);
        expect(typeof (transport.observe as jest.Mock).mock.calls[0]?.[1]).toBe('number');
    });

    it('emits observation after Promise resolves', async () => {
        expect.assertions(3);
        const transport = makeTransportMock();
        const decorator = createHistogramMetric({ transport })();

        const original = async function (this: unknown): Promise<number> {
            await new Promise<void>((resolve) => setTimeout(resolve, 1));
            return 99;
        };
        const wrapped = decorator(original, makeStage3Context<typeof original>('asyncWork'));

        class Svc {
            readonly asyncWork = wrapped;
        }
        const out = await new Svc().asyncWork();

        expect(out).toBe(99);
        expect(transport.observe).toHaveBeenCalledTimes(1);
        expect(typeof (transport.observe as jest.Mock).mock.calls[0]?.[1]).toBe('number');
    });

    it('emits observation after Promise rejects (and rethrows)', async () => {
        expect.assertions(3);
        const transport = makeTransportMock();
        const decorator = createHistogramMetric({ transport })();
        const boom = new Error('async-error');

        const original = async function (this: unknown): Promise<never> {
            await new Promise<void>((resolve) => setTimeout(resolve, 1));
            throw boom;
        };
        const wrapped = decorator(original, makeStage3Context<typeof original>('asyncFail'));

        class Svc {
            readonly asyncFail = wrapped;
        }

        await expect(new Svc().asyncFail()).rejects.toBe(boom);
        expect(transport.observe).toHaveBeenCalledTimes(1);
        expect(typeof (transport.observe as jest.Mock).mock.calls[0]?.[1]).toBe('number');
    });

    it('works with no config argument (undefined config)', () => {
        expect.assertions(1);
        const transport = makeTransportMock();
        // Call the inner factory with no argument at all
        const decorator = createHistogramMetric({ transport })();

        const original = function (this: unknown): void {
            // no-op
        };
        const wrapped = decorator(original, makeStage3Context<typeof original>('noop'));

        class Svc {
            readonly noop = wrapped;
        }
        new Svc().noop();

        expect(transport.observe).toHaveBeenCalledTimes(1);
    });

    it('passes extra strategies through to the engine', () => {
        expect.assertions(1);
        const transport = makeTransportMock();
        const nonMatchingStrategy = {
            matches: () => false,
            handle: <T>(v: T) => v,
        };
        const decorator = createHistogramMetric({ transport, strategies: [nonMatchingStrategy] })();

        const original = function (this: unknown): number {
            return 7;
        };
        const wrapped = decorator(original, makeStage3Context<typeof original>('run'));

        class Svc {
            readonly run = wrapped;
        }
        new Svc().run();

        expect(transport.observe).toHaveBeenCalledTimes(1);
    });
});

// ---------------------------------------------------------------------------
// createLegacyHistogramMetric (experimentalDecorators)
// ---------------------------------------------------------------------------

describe('createLegacyHistogramMetric (legacy)', () => {
    const applyLegacyDecorator = <T extends object>(
        proto: T,
        methodName: string,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        decoratorFn: (target: object, propertyKey: string, descriptor: TypedPropertyDescriptor<any>) => TypedPropertyDescriptor<any>
    ): void => {
        const descriptor = Object.getOwnPropertyDescriptor(proto, methodName) as PropertyDescriptor;
        Object.defineProperty(proto, methodName, decoratorFn(proto, methodName, descriptor as never));
    };

    it('derives default name from className + methodName', () => {
        expect.assertions(2);
        const transport = makeTransportMock();
        const decorator = createLegacyHistogramMetric({ transport })();

        class LegacyService {
            // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
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
            // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
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
            // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
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
            // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
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
            // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
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
            // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
            async asyncWork() {
                await new Promise<void>((resolve) => setTimeout(resolve, 1));
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
            // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
            async asyncFail() {
                await new Promise<void>((resolve) => setTimeout(resolve, 1));
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
            // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
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
            handle: <T>(v: T) => v,
        };
        const decorator = createLegacyHistogramMetric({ transport, strategies: [nonMatchingStrategy] })();

        class Svc {
            // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
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
            // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
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
