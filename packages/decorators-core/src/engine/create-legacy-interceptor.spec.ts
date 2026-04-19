import { describe, expect, it } from '@jest/globals';

import { createLegacyInterceptor } from './create-legacy-interceptor';
import type { ExecutionContextInterface } from '../type/execution-context.interface';
import type { InterceptorInterface } from '../type/interceptor.interface';
import type { ResultStrategyInterface } from '../type/result-strategy.interface';

interface RecordedCallInterface {
    readonly kind: 'enter' | 'success' | 'error';
    readonly context: ExecutionContextInterface<readonly unknown[]>;
    readonly value?: unknown;
    readonly durationMs?: number;
}

const makeRecorder = (): {
    readonly calls: RecordedCallInterface[];
    readonly interceptor: InterceptorInterface<readonly unknown[], unknown>;
} => {
    const calls: RecordedCallInterface[] = [];
    return {
        calls,
        interceptor: {
            onEnter: (context) => {
                calls.push({ kind: 'enter', context });
            },
            onSuccess: (context, value, durationMs) => {
                calls.push({ kind: 'success', context, value, durationMs });
            },
            onError: (context, error, durationMs) => {
                calls.push({ kind: 'error', context, value: error, durationMs });
            },
        },
    };
};

describe('createLegacyInterceptor', () => {
    it('wraps a sync method and emits enter + success with duration', () => {
        const { calls, interceptor } = makeRecorder();
        const decorator = createLegacyInterceptor({ interceptor });

        class Svc {
            value = 10;
            // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
            add(n: number) {
                return this.value + n;
            }
        }

        const descriptor = Object.getOwnPropertyDescriptor(Svc.prototype, 'add') as PropertyDescriptor;
        const updated = decorator(Svc.prototype, 'add', descriptor as never);
        Object.defineProperty(Svc.prototype, 'add', updated);

        expect(new Svc().add(5)).toBe(15);
        expect(calls).toHaveLength(2);
        expect(calls[0]?.kind).toBe('enter');
        expect(calls[0]?.context.className).toBe('Svc');
        expect(calls[0]?.context.methodName).toBe('add');
        expect(calls[0]?.context.logContext).toBe('Svc::add');
        expect(calls[0]?.context.args).toEqual([5]);
        expect(calls[1]?.kind).toBe('success');
        expect(calls[1]?.value).toBe(15);
        expect(typeof calls[1]?.durationMs).toBe('number');
        expect(calls[1]?.durationMs).toBeGreaterThanOrEqual(0);
    });

    it('awaits a Promise return and emits success after resolution', async () => {
        const { calls, interceptor } = makeRecorder();
        const decorator = createLegacyInterceptor({ interceptor });

        class AsyncSvc {
            // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
            async compute(n: number) {
                await new Promise((resolve) => setTimeout(resolve, 1));
                return n * 2;
            }
        }
        const descriptor = Object.getOwnPropertyDescriptor(AsyncSvc.prototype, 'compute') as PropertyDescriptor;
        Object.defineProperty(AsyncSvc.prototype, 'compute', decorator(AsyncSvc.prototype, 'compute', descriptor as never));

        const result = await new AsyncSvc().compute(4);
        expect(result).toBe(8);
        expect(calls.map((c) => c.kind)).toEqual(['enter', 'success']);
        expect(calls[1]?.value).toBe(8);
    });

    it('emits error and rethrows for a sync throw', () => {
        const { calls, interceptor } = makeRecorder();
        const decorator = createLegacyInterceptor({ interceptor });
        const boom = new Error('boom');

        class Svc {
            fail(): never {
                throw boom;
            }
        }
        const descriptor = Object.getOwnPropertyDescriptor(Svc.prototype, 'fail') as PropertyDescriptor;
        Object.defineProperty(Svc.prototype, 'fail', decorator(Svc.prototype, 'fail', descriptor as never));

        expect(() => new Svc().fail()).toThrow(boom);
        expect(calls.map((c) => c.kind)).toEqual(['enter', 'error']);
        expect(calls[1]?.value).toBe(boom);
    });

    it('emits error and rethrows for a rejected Promise', async () => {
        const { calls, interceptor } = makeRecorder();
        const decorator = createLegacyInterceptor({ interceptor });
        const boom = new Error('async-boom');

        class AsyncSvc {
            // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
            async fail() {
                await new Promise((resolve) => setTimeout(resolve, 1));
                throw boom;
            }
        }
        const descriptor = Object.getOwnPropertyDescriptor(AsyncSvc.prototype, 'fail') as PropertyDescriptor;
        Object.defineProperty(AsyncSvc.prototype, 'fail', decorator(AsyncSvc.prototype, 'fail', descriptor as never));

        await expect(new AsyncSvc().fail()).rejects.toBe(boom);
        expect(calls.map((c) => c.kind)).toEqual(['enter', 'error']);
        expect(calls[1]?.value).toBe(boom);
    });

    it('dispatches to the FIRST matching strategy when multiple could match', () => {
        const hits: string[] = [];
        const strategyA: ResultStrategyInterface = {
            matches: () => true,
            handle: (value, onSuccess) => {
                hits.push('A');
                onSuccess(value);
                return value;
            },
        };
        const strategyB: ResultStrategyInterface = {
            matches: () => true,
            handle: () => {
                hits.push('B');
                throw new Error('should not run');
            },
        };
        const { interceptor } = makeRecorder();
        const decorator = createLegacyInterceptor({ interceptor, strategies: [strategyA, strategyB] });

        class Svc {
            // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
            value() {
                return 7;
            }
        }
        const descriptor = Object.getOwnPropertyDescriptor(Svc.prototype, 'value') as PropertyDescriptor;
        Object.defineProperty(Svc.prototype, 'value', decorator(Svc.prototype, 'value', descriptor as never));
        new Svc().value();
        expect(hits).toEqual(['A']);
    });

    it('preserves ExecutionContext identity across onEnter, onSuccess, and onError', () => {
        // HistogramMetric's per-invocation WeakMap bridge relies on this contract.
        const seenContexts: unknown[] = [];
        const decorator = createLegacyInterceptor({
            interceptor: {
                onEnter: (ctx) => seenContexts.push(ctx),
                onSuccess: (ctx) => seenContexts.push(ctx),
                onError: (ctx) => seenContexts.push(ctx),
            },
        });

        class Svc {
            ok(): number {
                return 1;
            }
            fail(): never {
                throw new Error('x');
            }
        }
        const okDesc = Object.getOwnPropertyDescriptor(Svc.prototype, 'ok') as PropertyDescriptor;
        Object.defineProperty(Svc.prototype, 'ok', decorator(Svc.prototype, 'ok', okDesc as never));
        const failDesc = Object.getOwnPropertyDescriptor(Svc.prototype, 'fail') as PropertyDescriptor;
        Object.defineProperty(Svc.prototype, 'fail', decorator(Svc.prototype, 'fail', failDesc as never));

        new Svc().ok();
        expect(() => new Svc().fail()).toThrow('x');

        // Two invocations → two DISTINCT contexts; hooks within each invocation share one context
        expect(seenContexts).toHaveLength(4);
        expect(seenContexts[0]).toBe(seenContexts[1]); // onEnter & onSuccess of ok() — same context
        expect(seenContexts[2]).toBe(seenContexts[3]); // onEnter & onError of fail() — same context
        expect(seenContexts[0]).not.toBe(seenContexts[2]); // different invocations — different contexts
    });

    it('skips non-matching strategies and falls through to default sync handling', () => {
        const strategy: ResultStrategyInterface = {
            matches: () => false,
            handle: () => {
                throw new Error('should not be called');
            },
        };
        const { calls, interceptor } = makeRecorder();
        const decorator = createLegacyInterceptor({ interceptor, strategies: [strategy] });

        class Svc {
            // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
            value() {
                return 'v';
            }
        }
        const descriptor = Object.getOwnPropertyDescriptor(Svc.prototype, 'value') as PropertyDescriptor;
        Object.defineProperty(Svc.prototype, 'value', decorator(Svc.prototype, 'value', descriptor as never));
        expect(new Svc().value()).toBe('v');
        expect(calls.map((c) => c.kind)).toEqual(['enter', 'success']);
    });

    it('dispatches to a matching ResultStrategy and does not auto-handle Promise', () => {
        const matched: unknown[] = [];
        const strategy: ResultStrategyInterface = {
            matches: (value) =>
                typeof value === 'object' && value !== null && (value as { readonly __obs?: boolean }).__obs === true,
            handle: (value, onSuccess, onError) => {
                matched.push(value);
                onSuccess('strategy-resolved');
                onError('strategy-errored');
                return value;
            },
        };
        const { calls, interceptor } = makeRecorder();
        const decorator = createLegacyInterceptor({ interceptor, strategies: [strategy] });

        class Svc {
            // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
            stream() {
                return { __obs: true, value: 42 } as const;
            }
        }
        const descriptor = Object.getOwnPropertyDescriptor(Svc.prototype, 'stream') as PropertyDescriptor;
        Object.defineProperty(Svc.prototype, 'stream', decorator(Svc.prototype, 'stream', descriptor as never));

        const out = new Svc().stream();
        expect(matched).toHaveLength(1);
        expect(out).toEqual({ __obs: true, value: 42 });
        // strategy invoked both onSuccess and onError — both should be recorded
        expect(calls.map((c) => c.kind)).toEqual(['enter', 'success', 'error']);
        expect(calls[1]?.value).toBe('strategy-resolved');
        expect(calls[2]?.value).toBe('strategy-errored');
    });

    it('swallows errors thrown inside hooks and still returns the method value', () => {
        const decorator = createLegacyInterceptor({
            interceptor: {
                onEnter: () => {
                    throw new Error('enter-fail');
                },
                onSuccess: () => {
                    throw new Error('success-fail');
                },
                onError: () => {
                    throw new Error('error-fail');
                },
            },
        });

        class Svc {
            ok(): number {
                return 7;
            }
        }
        const descriptor = Object.getOwnPropertyDescriptor(Svc.prototype, 'ok') as PropertyDescriptor;
        Object.defineProperty(Svc.prototype, 'ok', decorator(Svc.prototype, 'ok', descriptor as never));

        expect(new Svc().ok()).toBe(7);
    });

    it('swallows hook errors on error path and still rethrows original', () => {
        const decorator = createLegacyInterceptor({
            interceptor: {
                onError: () => {
                    throw new Error('hook');
                },
            },
        });

        class Svc {
            fail(): never {
                throw new Error('original');
            }
        }
        const descriptor = Object.getOwnPropertyDescriptor(Svc.prototype, 'fail') as PropertyDescriptor;
        Object.defineProperty(Svc.prototype, 'fail', decorator(Svc.prototype, 'fail', descriptor as never));

        expect(() => new Svc().fail()).toThrow('original');
    });

    it('works without any interceptor hooks defined', () => {
        const decorator = createLegacyInterceptor({ interceptor: {} });

        class Svc {
            val(): string {
                return 'x';
            }
        }
        const descriptor = Object.getOwnPropertyDescriptor(Svc.prototype, 'val') as PropertyDescriptor;
        Object.defineProperty(Svc.prototype, 'val', decorator(Svc.prototype, 'val', descriptor as never));

        expect(new Svc().val()).toBe('x');
    });

    it('rethrows sync errors when no onError hook is defined', () => {
        const decorator = createLegacyInterceptor({ interceptor: {} });

        class Svc {
            fail(): never {
                throw new Error('no-hook');
            }
        }
        const descriptor = Object.getOwnPropertyDescriptor(Svc.prototype, 'fail') as PropertyDescriptor;
        Object.defineProperty(Svc.prototype, 'fail', decorator(Svc.prototype, 'fail', descriptor as never));
        expect(() => new Svc().fail()).toThrow('no-hook');
    });

    it('rethrows async errors when no onError hook is defined', async () => {
        const decorator = createLegacyInterceptor({ interceptor: {} });

        class Svc {
            // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
            async fail() {
                throw new Error('no-hook-async');
            }
        }
        const descriptor = Object.getOwnPropertyDescriptor(Svc.prototype, 'fail') as PropertyDescriptor;
        Object.defineProperty(Svc.prototype, 'fail', decorator(Svc.prototype, 'fail', descriptor as never));
        await expect(new Svc().fail()).rejects.toThrow('no-hook-async');
    });

    it('auto-handles Promise returns when no strategies are configured', async () => {
        const { calls, interceptor } = makeRecorder();
        const decorator = createLegacyInterceptor({ interceptor });

        class Svc {
            // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
            thenable() {
                return { then: (onResolve: (v: number) => void) => onResolve(21) };
            }
        }
        const descriptor = Object.getOwnPropertyDescriptor(Svc.prototype, 'thenable') as PropertyDescriptor;
        Object.defineProperty(
            Svc.prototype,
            'thenable',
            decorator(Svc.prototype, 'thenable', descriptor as never)
        );
        const out = await (new Svc().thenable() as unknown as Promise<number>);
        expect(out).toBe(21);
        expect(calls.map((c) => c.kind)).toEqual(['enter', 'success']);
        expect(calls[1]?.value).toBe(21);
    });

    it('emits error from a rejected thenable with no strategies', async () => {
        const { calls, interceptor } = makeRecorder();
        const decorator = createLegacyInterceptor({ interceptor });
        const boom = new Error('thenable-fail');

        class Svc {
            // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
            thenable() {
                return {
                    then: (_: (v: unknown) => void, onReject: (e: unknown) => void) => onReject(boom),
                };
            }
        }
        const descriptor = Object.getOwnPropertyDescriptor(Svc.prototype, 'thenable') as PropertyDescriptor;
        Object.defineProperty(
            Svc.prototype,
            'thenable',
            decorator(Svc.prototype, 'thenable', descriptor as never)
        );
        await expect(new Svc().thenable() as unknown as Promise<unknown>).rejects.toBe(boom);
        expect(calls.map((c) => c.kind)).toEqual(['enter', 'error']);
    });

    it('returns the descriptor unchanged when value is not a function', () => {
        const decorator = createLegacyInterceptor({ interceptor: {} });

        const input: PropertyDescriptor = { value: 42, writable: true, configurable: true, enumerable: true };
        const output = decorator({}, 'x', input as never);
        expect(output).toBe(input);
    });

    it('resolves className from `this` at call time (subclass)', () => {
        const { calls, interceptor } = makeRecorder();
        const decorator = createLegacyInterceptor({ interceptor });

        class Base {
            // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
            greet() {
                return 'hello';
            }
        }
        const descriptor = Object.getOwnPropertyDescriptor(Base.prototype, 'greet') as PropertyDescriptor;
        Object.defineProperty(Base.prototype, 'greet', decorator(Base.prototype, 'greet', descriptor as never));

        class Child extends Base {}
        new Child().greet();

        expect(calls[0]?.context.className).toBe('Child');
    });

    it('falls back to "Object" when target has no constructor name at decoration time', () => {
        const { calls, interceptor } = makeRecorder();
        const decorator = createLegacyInterceptor({ interceptor });

        const bareTarget = Object.create(null) as { ping?: () => number };
        const descriptor: PropertyDescriptor = {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            value: function ping(): number {
                return 1;
            },
            writable: true,
            configurable: true,
            enumerable: true,
        };
        const updated = decorator(bareTarget as object, 'ping', descriptor as never);
        Object.defineProperty(bareTarget, 'ping', updated);
        (bareTarget.ping as () => number).call(null);

        expect(calls[0]?.context.className).toBe('Object');
    });

    it('falls back to target.constructor.name when called with detached this', () => {
        const { calls, interceptor } = makeRecorder();
        const decorator = createLegacyInterceptor({ interceptor });

        class Svc {
            // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
            ping() {
                return 1;
            }
        }
        const descriptor = Object.getOwnPropertyDescriptor(Svc.prototype, 'ping') as PropertyDescriptor;
        Object.defineProperty(Svc.prototype, 'ping', decorator(Svc.prototype, 'ping', descriptor as never));

        const instance = new Svc();
        const detached = instance.ping;
        // call with `undefined` this — buildContext should fall back to the captured class name
        detached.call(undefined);
        expect(calls[0]?.context.className).toBe('Svc');
    });
});
