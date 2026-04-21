
import { promiseStrategy } from '../../strategy/promise-strategy/promise.strategy';
import { syncStrategy } from '../../strategy/sync-strategy/sync.strategy';
import { resolveFallbackClassName } from '../../util/resolve-fallback-class-name/resolve-fallback-class-name';
import { buildContext } from '../build-context/build-context';
import { runInterception } from '../run-interception/run-interception';

import type { CreateInterceptorOptionsInterface } from '../../interface/create-interceptor-options.interface';
import type { ResultStrategyInterface } from '../../interface/result-strategy.interface';
import type { AnyFn, MethodDecoratorType } from '@rnw-community/shared';

export const createInterceptor = <TArgs extends readonly unknown[], TResult>(
    options: CreateInterceptorOptionsInterface<TArgs, TResult>
): MethodDecoratorType<AnyFn> => {
    const strategies: readonly ResultStrategyInterface[] = [
        ...(options.strategies ?? []),
        promiseStrategy,
        syncStrategy,
    ];

    return (target, propertyKey, descriptor) => {
        const methodName = String(propertyKey);
        const fallbackClassName = resolveFallbackClassName(target);

        const originalMethod = descriptor.value;
        if (typeof originalMethod !== 'function') {
            return descriptor;
        }

        const interceptedMethod = function interceptedMethod(this: unknown, ...args: TArgs): TResult {
            const execContext = buildContext(this, fallbackClassName, methodName, args);

            return runInterception(options.interceptor, strategies, execContext, () =>
                (originalMethod as unknown as (this: unknown, ...methodArgs: unknown[]) => TResult).apply(this, [...args])
            );
        };

        return {
            ...descriptor,
            value: interceptedMethod as unknown as typeof descriptor.value,
        };
    };
};
