import { isPromise } from '@rnw-community/shared';

import type { ExecutionContextInterface } from '../../type/execution-context-interface/execution-context.interface';
import type { InterceptorInterface } from '../../type/interceptor-interface/interceptor.interface';
import type { ResultStrategyInterface } from '../../type/result-strategy-interface/result-strategy.interface';

const swallow = (fn: () => void): void => {
    try {
        fn();
    } catch {
        // eslint-disable-next-line no-empty
    }
};

export const runInterception = <TArgs extends readonly unknown[], TResult>(
    interceptor: InterceptorInterface<TArgs, TResult>,
    strategies: readonly ResultStrategyInterface[],
    context: ExecutionContextInterface<TArgs>,
    invoke: () => TResult
): TResult => {
    const start = performance.now();
    const emitEnter = (): void => {
        if (interceptor.onEnter !== undefined) {
            swallow(() => interceptor.onEnter!(context));
        }
    };
    const emitSuccess = (resolved: unknown): void => {
        if (interceptor.onSuccess !== undefined) {
            swallow(() => interceptor.onSuccess!(context, resolved as Awaited<TResult>, performance.now() - start));
        }
    };
    const emitError = (error: unknown): void => {
        if (interceptor.onError !== undefined) {
            swallow(() => interceptor.onError!(context, error, performance.now() - start));
        }
    };

    emitEnter();

    let rawResult: TResult;
    try {
        rawResult = invoke();
    } catch (error) {
        emitError(error);
        throw error;
    }

    const strategy = strategies.find((s) => s.matches(rawResult));
    if (strategy !== undefined) {
        return strategy.handle(rawResult, emitSuccess, emitError);
    }

    if (isPromise<unknown>(rawResult)) {
        return Promise.resolve(rawResult).then(
            (resolved: unknown) => {
                emitSuccess(resolved);
                return resolved;
            },
            (error: unknown) => {
                emitError(error);
                throw error;
            }
        ) as TResult;
    }

    emitSuccess(rawResult);
    return rawResult;
};
