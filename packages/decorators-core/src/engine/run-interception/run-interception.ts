import { isPromise } from '@rnw-community/shared';

import type { ExecutionContextInterface } from '../../interface/execution-context.interface';
import type { InterceptorInterface } from '../../interface/interceptor.interface';
import type { ResultStrategyInterface } from '../../interface/result-strategy.interface';

const swallow = (fn: () => void): void => {
    try {
        fn();
    } catch {
        void 0;
    }
};

const makeEmitEnter = <TArgs extends readonly unknown[], TResult>(
    interceptor: InterceptorInterface<TArgs, TResult>,
    context: ExecutionContextInterface<TArgs>
): (() => void) =>
    (): void => {
        if (interceptor.onEnter !== void 0) {
            swallow(() => void interceptor.onEnter?.(context));
        }
    };

const makeEmitSuccess = <TArgs extends readonly unknown[], TResult>(
    interceptor: InterceptorInterface<TArgs, TResult>,
    context: ExecutionContextInterface<TArgs>,
    start: number
): ((resolved: unknown) => void) =>
    (resolved: unknown): void => {
        if (interceptor.onSuccess !== void 0) {
            swallow(() => void interceptor.onSuccess?.(context, resolved as Awaited<TResult>, performance.now() - start));
        }
    };

const makeEmitError = <TArgs extends readonly unknown[], TResult>(
    interceptor: InterceptorInterface<TArgs, TResult>,
    context: ExecutionContextInterface<TArgs>,
    start: number
): ((error: unknown) => void) =>
    (error: unknown): void => {
        if (interceptor.onError !== void 0) {
            swallow(() => void interceptor.onError?.(context, error, performance.now() - start));
        }
    };

const handlePromiseResult = <TResult>(
    rawResult: TResult,
    emitSuccess: (resolved: unknown) => void,
    emitError: (error: unknown) => void
): TResult =>
    Promise.resolve(rawResult).then(
        (resolved: unknown) => {
            emitSuccess(resolved);

            return resolved;
        },
        (error: unknown) => {
            emitError(error);
            throw error;
        }
    ) as TResult;

const invokeAndEmitError = <TResult>(invoke: () => TResult, emitError: (error: unknown) => void): TResult => {
    try {
        return invoke();
    } catch (error) {
        emitError(error);
        throw error;
    }
};

const dispatchResult = <TResult>(
    rawResult: TResult,
    strategies: readonly ResultStrategyInterface[],
    emitSuccess: (resolved: unknown) => void,
    emitError: (error: unknown) => void
): TResult => {
    const strategy = strategies.find((item) => item.matches(rawResult));
    if (strategy !== void 0) {
        return strategy.handle(rawResult, emitSuccess, emitError);
    }

    if (isPromise(rawResult)) {
        return handlePromiseResult(rawResult, emitSuccess, emitError);
    }

    emitSuccess(rawResult);

    return rawResult;
};

export const runInterception = <TArgs extends readonly unknown[], TResult>(
    interceptor: InterceptorInterface<TArgs, TResult>,
    strategies: readonly ResultStrategyInterface[],
    context: ExecutionContextInterface<TArgs>,
    invoke: () => TResult
): TResult => {
    const start = performance.now();
    const emitEnter = makeEmitEnter(interceptor, context);
    const emitSuccess = makeEmitSuccess(interceptor, context, start);
    const emitError = makeEmitError(interceptor, context, start);

    emitEnter();

    const rawResult = invokeAndEmitError(invoke, emitError);

    return dispatchResult(rawResult, strategies, emitSuccess, emitError);
};
