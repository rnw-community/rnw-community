
import { resolveFallbackClassName } from '../../util/resolve-fallback-class-name/resolve-fallback-class-name';
import { buildContext } from '../build-context/build-context';

import type { CreateInterceptorOptionsInterface } from '../../interface/create-interceptor-options.interface';
import type { AnyFn, MethodDecoratorType } from '@rnw-community/shared';

/**
 * Builds an `experimentalDecorators` method decorator that wraps the decorated method with a single `InterceptorMiddleware`, the foundation for custom log, metric, and lock decorators.
 *
 * @see https://github.com/rnw-community/rnw-community/blob/master/packages/decorators-core/readme.md#createinterceptor
 */
export const createInterceptor = <TArgs extends readonly unknown[], TResult>(
    options: CreateInterceptorOptionsInterface<TArgs, TResult>
): MethodDecoratorType<AnyFn> => {
    const { middleware } = options;

    return (target, propertyKey, descriptor) => {
        const methodName = String(propertyKey);
        const fallbackClassName = resolveFallbackClassName(target);
        const originalMethod = descriptor.value;

        if (typeof originalMethod !== 'function') {
            return descriptor;
        }

        const interceptedMethod = function interceptedMethod(this: unknown, ...args: TArgs): TResult {
            const context = buildContext(this, fallbackClassName, methodName, args);
            const invoke = (): TResult =>
                (originalMethod as (this: unknown, ...methodArgs: unknown[]) => TResult).apply(this, [...args]);

            return middleware(context, invoke);
        };

        return {
            ...descriptor,
            value: interceptedMethod as unknown as typeof descriptor.value,
        };
    };
};
