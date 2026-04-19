import { isPromise } from '@rnw-community/shared';

import type { ExecutionContextInterface } from '../../type/execution-context-interface/execution-context.interface';
import type { InterceptorInterface } from '../../type/interceptor-interface/interceptor.interface';
import type { ResultStrategyInterface } from '../../type/result-strategy-interface/result-strategy.interface';
import { now } from '../../util/now/now';

const swallow = (fn: () => void): void => {
    try {
        fn();
    } catch {
        // eslint-disable-next-line no-empty
    }
};

const firstMatchingStrategy = (strategies: readonly ResultStrategyInterface[], value: unknown): ResultStrategyInterface | undefined =>
    strategies.find((strategy) => strategy.matches(value));

export const runInterception = <TArgs extends readonly unknown[], TResult>(
    interceptor: InterceptorInterface<TArgs, TResult>,
    strategies: readonly ResultStrategyInterface[],
    context: ExecutionContextInterface<TArgs>,
    invoke: () => TResult
): TResult => {
    const start = now();
    const emitEnter = (): void => {
        if (interceptor.onEnter !== undefined) {
            swallow(() => interceptor.onEnter!(context));
        }
    };
    const emitSuccess = (resolved: unknown): void => {
        if (interceptor.onSuccess !== undefined) {
            swallow(() => interceptor.onSuccess!(context, resolved as Awaited<TResult>, now() - start));
        }
    };
    const emitError = (error: unknown): void => {
        if (interceptor.onError !== undefined) {
            swallow(() => interceptor.onError!(context, error, now() - start));
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

    const strategy = firstMatchingStrategy(strategies, rawResult);
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
