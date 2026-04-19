import { describe, expect, it } from '@jest/globals';

import { createInterceptor } from './create-interceptor';
import type { ExecutionContextInterface } from '../type/execution-context.interface';

describe('createInterceptor (stage-3)', () => {
    // Minimal shim of a stage-3 context — our factory only reads `context.name`.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const makeContext = <TFn extends (this: unknown, ...args: any) => any>(
        name: string | symbol
    ): ClassMethodDecoratorContext<unknown, TFn> =>
        ({ kind: 'method', name, static: false, private: false, access: { get: () => undefined as unknown as TFn } } as unknown as ClassMethodDecoratorContext<unknown, TFn>);

    it('wraps a sync method and emits enter + success', () => {
        const records: { kind: string; ctx: ExecutionContextInterface<readonly unknown[]>; value?: unknown }[] = [];
        const decorator = createInterceptor({
            interceptor: {
                onEnter: (ctx) => records.push({ kind: 'enter', ctx }),
                onSuccess: (ctx, value) => records.push({ kind: 'success', ctx, value }),
            },
        });

        const original = function (this: unknown, ...args: readonly unknown[]): string {
            const [greeting] = args as readonly [string];
            return `${greeting} ${(this as { readonly name: string }).name}`;
        };
        const wrapped = decorator(original as (this: unknown, ...args: readonly unknown[]) => string, makeContext<typeof original>('greet'));

        class Service {
            readonly name = 'World';
            readonly greet = wrapped;
        }

        const out = new Service().greet('hello');
        expect(out).toBe('hello World');
        expect(records.map((r) => r.kind)).toEqual(['enter', 'success']);
        expect(records[0]?.ctx.methodName).toBe('greet');
        expect(records[0]?.ctx.className).toBe('Service');
        expect(records[1]?.value).toBe('hello World');
    });

    it('handles a symbol method name', () => {
        const records: { kind: string; ctx: ExecutionContextInterface<readonly unknown[]> }[] = [];
        const decorator = createInterceptor({
            interceptor: { onEnter: (ctx) => records.push({ kind: 'enter', ctx }) },
        });
        const sym = Symbol('m');
        const original = function (this: unknown): number {
            return 1;
        };
        const wrapped = decorator(original, makeContext<typeof original>(sym));
        class Svc {
            readonly [sym] = wrapped;
        }
        (new Svc() as unknown as { readonly [sym]: () => number })[sym]();
        expect(records[0]?.ctx.methodName).toBe(String(sym));
    });

    it('awaits a Promise', async () => {
        const records: { kind: string; value?: unknown }[] = [];
        const decorator = createInterceptor({
            interceptor: {
                onSuccess: (_ctx, value) => records.push({ kind: 'success', value }),
            },
        });
        const original = async function (this: unknown): Promise<number> {
            return 99;
        };
        const wrapped = decorator(original, makeContext<typeof original>('work'));
        class Svc {
            readonly work = wrapped;
        }
        const out = await new Svc().work();
        expect(out).toBe(99);
        expect(records[0]?.value).toBe(99);
    });

    it('reports "Object" when `this` has no meaningful constructor name', () => {
        const records: { ctx: ExecutionContextInterface<readonly unknown[]> }[] = [];
        const decorator = createInterceptor({
            interceptor: { onEnter: (ctx) => records.push({ ctx }) },
        });
        const original = function (this: unknown): number {
            return 0;
        };
        const wrapped = decorator(original, makeContext<typeof original>('run'));
        wrapped.call(null);
        wrapped.call(Object.create(null) as object);
        expect(records[0]?.ctx.className).toBe('Object');
        expect(records[1]?.ctx.className).toBe('Object');
    });
});
