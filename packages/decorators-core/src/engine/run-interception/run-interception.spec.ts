import { describe, expect, it, jest } from '@jest/globals';

import { runInterception } from './run-interception';

import type { ExecutionContextInterface } from '../../type/execution-context.interface';
import type { InterceptorInterface } from '../../type/interceptor.interface';
import type { ResultStrategyInterface } from '../../type/result-strategy.interface';

const makeContext = (): ExecutionContextInterface => ({
    className: 'TestClass',
    methodName: 'testMethod',
    args: [],
    logContext: 'TestClass::testMethod',
});

describe('runInterception', () => {
    it('calls onEnter and onSuccess for a sync invocation', () => {
        const records: string[] = [];
        const interceptor: InterceptorInterface<readonly unknown[], number> = {
            onEnter: () => records.push('enter'),
            onSuccess: () => records.push('success'),
        };
        const result = runInterception(interceptor, [], makeContext(), () => 42);
        expect(result).toBe(42);
        expect(records).toEqual(['enter', 'success']);
    });

    it('calls onEnter and onError then rethrows on sync throw', () => {
        const records: string[] = [];
        const boom = new Error('sync');
        const interceptor: InterceptorInterface<readonly unknown[], never> = {
            onEnter: () => records.push('enter'),
            onError: () => records.push('error'),
        };
        expect(() => runInterception(interceptor, [], makeContext(), () => { throw boom; })).toThrow(boom);
        expect(records).toEqual(['enter', 'error']);
    });

    it('awaits a Promise and emits success with resolved value', async () => {
        const onSuccess = jest.fn();
        const interceptor: InterceptorInterface<readonly unknown[], Promise<number>> = { onSuccess };
        const result = runInterception(interceptor, [], makeContext(), () => Promise.resolve(99));
        expect(await result).toBe(99);
        expect(onSuccess).toHaveBeenCalledWith(makeContext(), 99, expect.any(Number));
    });

    it('handles a rejected Promise and emits error then rethrows', async () => {
        const onError = jest.fn();
        const boom = new Error('async');
        const interceptor: InterceptorInterface<readonly unknown[], Promise<never>> = { onError };
        const result = runInterception(interceptor, [], makeContext(), () => Promise.reject(boom));
        await expect(result).rejects.toBe(boom);
        expect(onError).toHaveBeenCalledWith(makeContext(), boom, expect.any(Number));
    });

    it('dispatches to the FIRST matching strategy and skips subsequent ones', () => {
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
        runInterception({}, [strategyA, strategyB], makeContext(), () => 7);
        expect(hits).toEqual(['A']);
    });

    it('swallows errors thrown inside onEnter and still returns the method value', () => {
        const interceptor: InterceptorInterface<readonly unknown[], number> = {
            onEnter: () => { throw new Error('hook-enter'); },
            onSuccess: () => { throw new Error('hook-success'); },
        };
        expect(runInterception(interceptor, [], makeContext(), () => 5)).toBe(5);
    });

    it('swallows errors thrown inside onError and still rethrows original', () => {
        const boom = new Error('original');
        const interceptor: InterceptorInterface<readonly unknown[], never> = {
            onError: () => { throw new Error('hook-error'); },
        };
        expect(() => runInterception(interceptor, [], makeContext(), () => { throw boom; })).toThrow(boom);
    });

    it('preserves context identity across onEnter and onSuccess', () => {
        const seen: unknown[] = [];
        const interceptor: InterceptorInterface<readonly unknown[], number> = {
            onEnter: (ctx) => seen.push(ctx),
            onSuccess: (ctx) => seen.push(ctx),
        };
        const ctx = makeContext();
        runInterception(interceptor, [], ctx, () => 1);
        expect(seen).toHaveLength(2);
        expect(seen[0]).toBe(seen[1]);
        expect(seen[0]).toBe(ctx);
    });

    it('preserves context identity across onEnter and onError', () => {
        const seen: unknown[] = [];
        const interceptor: InterceptorInterface<readonly unknown[], never> = {
            onEnter: (ctx) => seen.push(ctx),
            onError: (ctx) => seen.push(ctx),
        };
        const ctx = makeContext();
        expect(() => runInterception(interceptor, [], ctx, () => { throw new Error('x'); })).toThrow('x');
        expect(seen).toHaveLength(2);
        expect(seen[0]).toBe(seen[1]);
        expect(seen[0]).toBe(ctx);
    });

    it('works without any hooks defined', () => {
        expect(runInterception({}, [], makeContext(), () => 'hello')).toBe('hello');
    });

    it('skips non-matching strategies and falls through to sync handling', () => {
        const strategy: ResultStrategyInterface = {
            matches: () => false,
            handle: () => { throw new Error('must not run'); },
        };
        const records: string[] = [];
        const interceptor: InterceptorInterface<readonly unknown[], string> = {
            onSuccess: () => records.push('success'),
        };
        expect(runInterception(interceptor, [strategy], makeContext(), () => 'val')).toBe('val');
        expect(records).toEqual(['success']);
    });
});
