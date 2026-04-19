import type { ExecutionContextInterface } from '../type/execution-context.interface';
import type { InterceptorInterface } from '../type/interceptor.interface';
import type { ResultStrategyInterface } from '../type/result-strategy.interface';
import { isPromiseLike } from '../util/is-promise';
import { now } from '../util/now';

const callSuccess = <TArgs extends readonly unknown[], TResult>(
    hook: InterceptorInterface<TArgs, TResult>['onSuccess'],
    context: ExecutionContextInterface<TArgs>,
    value: TResult,
    durationMs: number
): void => {
    if (hook === undefined) {
        return;
    }
    try {
        hook(context, value, durationMs);
    } catch {
        // Hooks must never poison the decorated method. Transport failures are
        // a best-effort concern, silently swallowed.
    }
};

const callError = <TArgs extends readonly unknown[], TResult>(
    hook: InterceptorInterface<TArgs, TResult>['onError'],
    context: ExecutionContextInterface<TArgs>,
    error: unknown,
    durationMs: number
): void => {
    if (hook === undefined) {
        return;
    }
    try {
        hook(context, error, durationMs);
    } catch {
        // See callSuccess.
    }
};

const callEnter = <TArgs extends readonly unknown[], TResult>(
    hook: InterceptorInterface<TArgs, TResult>['onEnter'],
    context: ExecutionContextInterface<TArgs>
): void => {
    if (hook === undefined) {
        return;
    }
    try {
        hook(context);
    } catch {
        // See callSuccess.
    }
};

export const runInterception = <TArgs extends readonly unknown[], TResult>(
    interceptor: InterceptorInterface<TArgs, TResult>,
    strategies: readonly ResultStrategyInterface[],
    context: ExecutionContextInterface<TArgs>,
    invoke: () => TResult
): TResult => {
    const start = now();

    callEnter(interceptor.onEnter, context);

    let rawResult: TResult;
    try {
        rawResult = invoke();
    } catch (error) {
        callError(interceptor.onError, context, error, now() - start);
        throw error;
    }

    const onSuccess = (resolved: unknown): void => {
        callSuccess(interceptor.onSuccess, context, resolved as TResult, now() - start);
    };
    const onError = (error: unknown): void => {
        callError(interceptor.onError, context, error, now() - start);
    };

    for (const strategy of strategies) {
        if (strategy.matches(rawResult)) {
            return strategy.handle(rawResult, onSuccess, onError);
        }
    }

    if (isPromiseLike<unknown>(rawResult)) {
        // Normalize thenables (including non-spec-compliant sync ones) via Promise.resolve
        // so that onSuccess/onError are always invoked asynchronously.
        return Promise.resolve(rawResult).then(
            (resolved: unknown) => {
                onSuccess(resolved);
                return resolved;
            },
            (error: unknown) => {
                onError(error);
                throw error;
            }
        ) as TResult;
    }

    onSuccess(rawResult);
    return rawResult;
};
