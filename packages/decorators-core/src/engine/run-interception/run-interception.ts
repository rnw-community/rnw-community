import { syncStrategy } from '../../strategy/sync-strategy/sync.strategy';
import { swallow } from '../../util/swallow/swallow';

import type { ExecutionContextInterface } from '../../interface/execution-context.interface';
import type { InterceptorInterface } from '../../interface/interceptor.interface';
import type { ResultStrategyInterface } from '../../interface/result-strategy.interface';

 
export const runInterception = <TArgs extends readonly unknown[], TResult>(
    interceptor: InterceptorInterface<TArgs, TResult>,
    strategies: readonly ResultStrategyInterface[],
    context: ExecutionContextInterface<TArgs>,
    invoke: () => TResult
): TResult => {
    const start = performance.now();

    const emitSuccess = (resolved: unknown): void => {
        if (interceptor.onSuccess !== void 0) {
            swallow(() => void interceptor.onSuccess?.(context, resolved as Awaited<TResult>, performance.now() - start));
        }
    };

    const emitError = (error: unknown): void => {
        if (interceptor.onError !== void 0) {
            swallow(() => void interceptor.onError?.(context, error, performance.now() - start));
        }
    };

    if (interceptor.onEnter !== void 0) {
        swallow(() => void interceptor.onEnter?.(context));
    }

    let rawResult: TResult;
    try {
        rawResult = invoke();
    } catch (error) {
        emitError(error);
        throw error;
    }

    const strategy = strategies.find((item) => item.matches(rawResult)) ?? syncStrategy;

    try {
        return strategy.handle(rawResult, emitSuccess, emitError);
    } catch (error) {
        emitError(error);
        throw error;
    }
};
