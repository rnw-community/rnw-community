import { type AnyFn, type MethodDecoratorType, isNotEmptyString } from '@rnw-community/shared';

import { promiseStrategy } from '../../strategy/promise-strategy/promise.strategy';
import { syncStrategy } from '../../strategy/sync-strategy/sync.strategy';
import { buildContext } from '../build-context/build-context';
import { runInterception } from '../run-interception/run-interception';

import type { CreateInterceptorOptionsInterface } from '../../interface/create-interceptor-options.interface';
import type { ResultStrategyInterface } from '../../interface/result-strategy.interface';

const resolveFallbackClassName = (target: object): string => {
    if (typeof target === 'function') {
        const { name } = (target as { readonly name?: string });
        if (isNotEmptyString(name)) {
            return name;
        }
    }
    const ctorName = (target as { readonly constructor?: { readonly name?: string } }).constructor?.name;

    return isNotEmptyString(ctorName) ? ctorName : 'Object';
};

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
