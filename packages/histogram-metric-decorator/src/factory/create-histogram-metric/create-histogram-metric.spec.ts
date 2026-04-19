import { describe, expect, it, jest } from '@jest/globals';

import type { HistogramTransportInterface } from '../../interface/histogram-transport-interface/histogram-transport.interface';
import { createHistogramMetric } from './create-histogram-metric';

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

describe('createHistogramMetric', () => {
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
            // eslint-disable-next-line no-empty
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
        const decorator = createHistogramMetric({ transport })();

        const original = function (this: unknown): void {
            // eslint-disable-next-line no-empty
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
            handle: <T>(v: T): T => v,
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
