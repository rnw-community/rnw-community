import { describe, expect, it } from '@jest/globals';

import { createInterceptor } from './create-interceptor';

import type { ExecutionContextInterface } from '../../interface/execution-context.interface';
import type { InterceptorInterface } from '../../interface/interceptor.interface';
import type { ResultStrategyInterface } from '../../interface/result-strategy.interface';

interface RecordedCallInterface {
    readonly kind: 'enter' | 'success' | 'error';
    readonly context: ExecutionContextInterface;
    readonly value?: unknown;
    readonly durationMs?: number;
}

const makeRecorder = (): {
    readonly calls: RecordedCallInterface[];
    readonly interceptor: InterceptorInterface;
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

describe('createInterceptor', () => {
    it('wraps a sync method and emits enter + success with duration', () => {
        const { calls, interceptor } = makeRecorder();
        const decorator = createInterceptor({ interceptor });

        class Svc {
            value = 10;

            add(num: number) {
                return this.value + num;
            }
        }

        const descriptor = Object.getOwnPropertyDescriptor(Svc.prototype, 'add') as PropertyDescriptor;
        const updated = decorator(Svc.prototype, 'add', descriptor as never) as PropertyDescriptor;
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
        const decorator = createInterceptor({ interceptor });

        class AsyncSvc {

            async compute(num: number) {
                await new Promise((resolve) => { setTimeout(resolve, 1); });

                return num * 2;
            }
        }
        const descriptor = Object.getOwnPropertyDescriptor(AsyncSvc.prototype, 'compute') as PropertyDescriptor;
        Object.defineProperty(AsyncSvc.prototype, 'compute', decorator(AsyncSvc.prototype, 'compute', descriptor as never) as PropertyDescriptor);

        const result = await new AsyncSvc().compute(4);
        expect(result).toBe(8);
        expect(calls.map((call) => call.kind)).toEqual(['enter', 'success']);
        expect(calls[1]?.value).toBe(8);
    });

    it('emits error and rethrows for a sync throw', () => {
        const { calls, interceptor } = makeRecorder();
        const decorator = createInterceptor({ interceptor });
        const boom = new Error('boom');

        class Svc {
            fail(): never {
                throw boom;
            }
        }
        const descriptor = Object.getOwnPropertyDescriptor(Svc.prototype, 'fail') as PropertyDescriptor;
        Object.defineProperty(Svc.prototype, 'fail', decorator(Svc.prototype, 'fail', descriptor as never) as PropertyDescriptor);

        expect(() => new Svc().fail()).toThrow(boom);
        expect(calls.map((call) => call.kind)).toEqual(['enter', 'error']);
        expect(calls[1]?.value).toBe(boom);
    });

    it('emits error and rethrows for a rejected Promise', async () => {
        const { calls, interceptor } = makeRecorder();
        const decorator = createInterceptor({ interceptor });
        const boom = new Error('async-boom');

        class AsyncSvc {

            async fail() {
                await new Promise((resolve) => { setTimeout(resolve, 1); });
                throw boom;
            }
        }
        const descriptor = Object.getOwnPropertyDescriptor(AsyncSvc.prototype, 'fail') as PropertyDescriptor;
        Object.defineProperty(AsyncSvc.prototype, 'fail', decorator(AsyncSvc.prototype, 'fail', descriptor as never) as PropertyDescriptor);

        await expect(new AsyncSvc().fail()).rejects.toBe(boom);
        expect(calls.map((call) => call.kind)).toEqual(['enter', 'error']);
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
        const decorator = createInterceptor({ interceptor, strategies: [strategyA, strategyB] });

        class Svc {

            value() {
                return 7;
            }
        }
        const descriptor = Object.getOwnPropertyDescriptor(Svc.prototype, 'value') as PropertyDescriptor;
        Object.defineProperty(Svc.prototype, 'value', decorator(Svc.prototype, 'value', descriptor as never) as PropertyDescriptor);
        new Svc().value();
        expect(hits).toEqual(['A']);
    });

    it('preserves ExecutionContext identity across onEnter, onSuccess, and onError', () => {
        const seenContexts: unknown[] = [];
        const decorator = createInterceptor({
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
        Object.defineProperty(Svc.prototype, 'ok', decorator(Svc.prototype, 'ok', okDesc as never) as PropertyDescriptor);
        const failDesc = Object.getOwnPropertyDescriptor(Svc.prototype, 'fail') as PropertyDescriptor;
        Object.defineProperty(Svc.prototype, 'fail', decorator(Svc.prototype, 'fail', failDesc as never) as PropertyDescriptor);

        new Svc().ok();
        expect(() => new Svc().fail()).toThrow('x');

        expect(seenContexts).toHaveLength(4);
        expect(seenContexts[0]).toBe(seenContexts[1]);
        expect(seenContexts[2]).toBe(seenContexts[3]);
        expect(seenContexts[0]).not.toBe(seenContexts[2]);
    });

    it('skips non-matching strategies and falls through to default sync handling', () => {
        const strategy: ResultStrategyInterface = {
            matches: () => false,
            handle: () => {
                throw new Error('should not be called');
            },
        };
        const { calls, interceptor } = makeRecorder();
        const decorator = createInterceptor({ interceptor, strategies: [strategy] });

        class Svc {

            value() {
                return 'v';
            }
        }
        const descriptor = Object.getOwnPropertyDescriptor(Svc.prototype, 'value') as PropertyDescriptor;
        Object.defineProperty(Svc.prototype, 'value', decorator(Svc.prototype, 'value', descriptor as never) as PropertyDescriptor);
        expect(new Svc().value()).toBe('v');
        expect(calls.map((call) => call.kind)).toEqual(['enter', 'success']);
    });

    it('dispatches to a matching ResultStrategy and does not auto-handle Promise', () => {
        const matched: unknown[] = [];
        const strategy: ResultStrategyInterface = {
            matches: (value) =>
                typeof value === 'object' && value !== null && (value as { readonly isObservableMarker?: boolean }).isObservableMarker === true,
            handle: (value, onSuccess, onError) => {
                matched.push(value);
                onSuccess('strategy-resolved');
                onError('strategy-errored');

                return value;
            },
        };
        const { calls, interceptor } = makeRecorder();
        const decorator = createInterceptor({ interceptor, strategies: [strategy] });

        class Svc {

            stream() {
                return { isObservableMarker: true, value: 42 } as const;
            }
        }
        const descriptor = Object.getOwnPropertyDescriptor(Svc.prototype, 'stream') as PropertyDescriptor;
        Object.defineProperty(Svc.prototype, 'stream', decorator(Svc.prototype, 'stream', descriptor as never) as PropertyDescriptor);

        const out = new Svc().stream();
        expect(matched).toHaveLength(1);
        expect(out).toEqual({ isObservableMarker: true, value: 42 });
        expect(calls.map((call) => call.kind)).toEqual(['enter', 'success', 'error']);
        expect(calls[1]?.value).toBe('strategy-resolved');
        expect(calls[2]?.value).toBe('strategy-errored');
    });

    it('swallows errors thrown inside hooks and still returns the method value', () => {
        const decorator = createInterceptor({
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
        Object.defineProperty(Svc.prototype, 'ok', decorator(Svc.prototype, 'ok', descriptor as never) as PropertyDescriptor);

        expect(new Svc().ok()).toBe(7);
    });

    it('swallows hook errors on error path and still rethrows original', () => {
        const decorator = createInterceptor({
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
        Object.defineProperty(Svc.prototype, 'fail', decorator(Svc.prototype, 'fail', descriptor as never) as PropertyDescriptor);

        expect(() => new Svc().fail()).toThrow('original');
    });

    it('works without any interceptor hooks defined', () => {
        const decorator = createInterceptor({ interceptor: {} });

        class Svc {
            val(): string {
                return 'x';
            }
        }
        const descriptor = Object.getOwnPropertyDescriptor(Svc.prototype, 'val') as PropertyDescriptor;
        Object.defineProperty(Svc.prototype, 'val', decorator(Svc.prototype, 'val', descriptor as never) as PropertyDescriptor);

        expect(new Svc().val()).toBe('x');
    });

    it('rethrows sync errors when no onError hook is defined', () => {
        const decorator = createInterceptor({ interceptor: {} });

        class Svc {
            fail(): never {
                throw new Error('no-hook');
            }
        }
        const descriptor = Object.getOwnPropertyDescriptor(Svc.prototype, 'fail') as PropertyDescriptor;
        Object.defineProperty(Svc.prototype, 'fail', decorator(Svc.prototype, 'fail', descriptor as never) as PropertyDescriptor);
        expect(() => new Svc().fail()).toThrow('no-hook');
    });

    it('rethrows async errors when no onError hook is defined', async () => {
        const decorator = createInterceptor({ interceptor: {} });

        class Svc {

            async fail() {
                throw new Error('no-hook-async');
            }
        }
        const descriptor = Object.getOwnPropertyDescriptor(Svc.prototype, 'fail') as PropertyDescriptor;
        Object.defineProperty(Svc.prototype, 'fail', decorator(Svc.prototype, 'fail', descriptor as never) as PropertyDescriptor);
        await expect(new Svc().fail()).rejects.toThrow('no-hook-async');
    });

    it('auto-handles Promise returns when no strategies are configured', async () => {
        const { calls, interceptor } = makeRecorder();
        const decorator = createInterceptor({ interceptor });

        class Svc {

            thenable() {
                return { then: (onResolve: (val: number) => void) => void onResolve(21) };
            }
        }
        const descriptor = Object.getOwnPropertyDescriptor(Svc.prototype, 'thenable') as PropertyDescriptor;
        Object.defineProperty(
            Svc.prototype,
            'thenable',
            decorator(Svc.prototype, 'thenable', descriptor as never) as PropertyDescriptor
        );
        const out = await (new Svc().thenable() as unknown as Promise<number>);
        expect(out).toBe(21);
        expect(calls.map((call) => call.kind)).toEqual(['enter', 'success']);
        expect(calls[1]?.value).toBe(21);
    });

    it('emits error from a rejected thenable with no strategies', async () => {
        const { calls, interceptor } = makeRecorder();
        const decorator = createInterceptor({ interceptor });
        const boom = new Error('thenable-fail');

        class Svc {

            thenable() {
                return {
                    then: (_: (val: unknown) => void, onReject: (err: unknown) => void) => void onReject(boom),
                };
            }
        }
        const descriptor = Object.getOwnPropertyDescriptor(Svc.prototype, 'thenable') as PropertyDescriptor;
        Object.defineProperty(
            Svc.prototype,
            'thenable',
            decorator(Svc.prototype, 'thenable', descriptor as never) as PropertyDescriptor
        );
        await expect(new Svc().thenable() as unknown as Promise<unknown>).rejects.toBe(boom);
        expect(calls.map((call) => call.kind)).toEqual(['enter', 'error']);
    });

    it('returns the descriptor unchanged when value is not a function', () => {
        const decorator = createInterceptor({ interceptor: {} });

        const input: PropertyDescriptor = { value: 42, writable: true, configurable: true, enumerable: true };
        const output = decorator({}, 'x', input as never) as PropertyDescriptor;
        expect(output).toBe(input);
    });

    it('resolves className from `this` at call time (subclass)', () => {
        const { calls, interceptor } = makeRecorder();
        const decorator = createInterceptor({ interceptor });

        class Base {

            greet() {
                return 'hello';
            }
        }
        const descriptor = Object.getOwnPropertyDescriptor(Base.prototype, 'greet') as PropertyDescriptor;
        Object.defineProperty(Base.prototype, 'greet', decorator(Base.prototype, 'greet', descriptor as never) as PropertyDescriptor);

        class Child extends Base {}
        new Child().greet();

        expect(calls[0]?.context.className).toBe('Child');
    });

    it('falls back to "Object" when target has no constructor name at decoration time', () => {
        const { calls, interceptor } = makeRecorder();
        const decorator = createInterceptor({ interceptor });

        const bareTarget = Object.create(null) as { ping?: () => number };
        const descriptor: PropertyDescriptor = {

            value: function value(): number {
                return 1;
            },
            writable: true,
            configurable: true,
            enumerable: true,
        };
        const updated = decorator(bareTarget as object, 'ping', descriptor as never) as PropertyDescriptor;
        Object.defineProperty(bareTarget, 'ping', updated);
        // eslint-disable-next-line no-useless-call
        (bareTarget.ping as () => number).call(null);

        expect(calls[0]?.context.className).toBe('Object');
    });

    it('falls back to target.constructor.name when called with detached this', () => {
        const { calls, interceptor } = makeRecorder();
        const decorator = createInterceptor({ interceptor });

        class Svc {

            ping() {
                return 1;
            }
        }
        const descriptor = Object.getOwnPropertyDescriptor(Svc.prototype, 'ping') as PropertyDescriptor;
        Object.defineProperty(Svc.prototype, 'ping', decorator(Svc.prototype, 'ping', descriptor as never) as PropertyDescriptor);

        const instance = new Svc();
        const detached = instance.ping.bind(void 0);
        detached();
        expect(calls[0]?.context.className).toBe('Svc');
    });

    it('uses target.name when target is a constructor (static method decoration)', () => {
        const { calls, interceptor } = makeRecorder();
        const decorator = createInterceptor({ interceptor });

        // eslint-disable-next-line @typescript-eslint/no-extraneous-class
        class StaticSvc {
            static compute(): number {
                return 99;
            }
        }

        const descriptor = Object.getOwnPropertyDescriptor(StaticSvc, 'compute') as PropertyDescriptor;
        Object.defineProperty(StaticSvc, 'compute', decorator(StaticSvc as unknown as object, 'compute', descriptor as never) as PropertyDescriptor);

        StaticSvc.compute();
        expect(calls[0]?.context.className).toBe('StaticSvc');
        expect(calls[0]?.context.methodName).toBe('compute');
    });

    it('falls back to constructor.name when target is an anonymous function', () => {
        const { calls, interceptor } = makeRecorder();
        const decorator = createInterceptor({ interceptor });

        const anonFn = function (): void {
            void 0;
        };
        Object.defineProperty(anonFn, 'name', { value: '' });
        const descriptor: PropertyDescriptor = {
            value: function value(): number {
                return 1;
            },
            writable: true,
            configurable: true,
            enumerable: true,
        };
        const updated = decorator(anonFn as unknown as object, 'compute', descriptor as never) as PropertyDescriptor;
        Object.defineProperty(anonFn, 'compute', updated);
        (anonFn as unknown as { compute: () => number }).compute.call(null);

        expect(calls[0]?.context.className).toBe('Function');
    });

    it('runs user-supplied strategies BEFORE auto-appended promiseStrategy', async () => {
        const userHandled: unknown[] = [];
        const userStrategy: ResultStrategyInterface = {
            matches: value => value instanceof Promise,
            handle: <TResult>(value: TResult, onSuccess: (resolved: unknown) => void, onError: (error: unknown) => void): TResult => {
                userHandled.push(value);

                return Promise.resolve(value).then(
                    (resolved: unknown) => {
                        onSuccess(resolved);

                        return resolved;
                    },
                    (err: unknown) => {
                        onError(err);
                        throw err;
                    }
                ) as TResult;
            },
        };
        const { calls, interceptor } = makeRecorder();
        const decorator = createInterceptor({ interceptor, strategies: [userStrategy] });

        class Svc {
            async run(): Promise<number> {
                return 7;
            }
        }
        const descriptor = Object.getOwnPropertyDescriptor(Svc.prototype, 'run') as PropertyDescriptor;
        Object.defineProperty(Svc.prototype, 'run', decorator(Svc.prototype, 'run', descriptor as never) as PropertyDescriptor);

        await new Svc().run();

        expect(userHandled).toHaveLength(1);
        expect(calls.map(call => call.kind)).toEqual(['enter', 'success']);
        expect(calls[1]?.value).toBe(7);
    });

    it('auto-appends syncStrategy as the terminal catch-all when no strategy matches', () => {
        const notMatching: ResultStrategyInterface = {
            matches: () => false,
            handle: () => {
                throw new Error('must not fire');
            },
        };
        const { calls, interceptor } = makeRecorder();
        const decorator = createInterceptor({ interceptor, strategies: [notMatching] });

        class Svc {
            run(): number {
                return 42;
            }
        }
        const descriptor = Object.getOwnPropertyDescriptor(Svc.prototype, 'run') as PropertyDescriptor;
        Object.defineProperty(Svc.prototype, 'run', decorator(Svc.prototype, 'run', descriptor as never) as PropertyDescriptor);

        expect(new Svc().run()).toBe(42);
        expect(calls.map(call => call.kind)).toEqual(['enter', 'success']);
        expect(calls[1]?.value).toBe(42);
    });
});
