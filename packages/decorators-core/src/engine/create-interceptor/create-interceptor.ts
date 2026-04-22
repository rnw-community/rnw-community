
import { resolveFallbackClassName } from '../../util/resolve-fallback-class-name/resolve-fallback-class-name';
import { buildContext } from '../build-context/build-context';

import type { CreateInterceptorOptionsInterface } from '../../interface/create-interceptor-options.interface';
import type { AnyFn, MethodDecoratorType } from '@rnw-community/shared';

export const createInterceptor = <TArgs extends readonly unknown[], TResult>(
    options: CreateInterceptorOptionsInterface<TArgs, TResult>
): MethodDecoratorType<AnyFn> => {
    const { middlewares } = options;

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
            const chain = middlewares.reduceRight<() => TResult>(
                (next, middleware) => () => middleware(context, next),
                invoke
            );

            return chain();
        };

        return {
            ...descriptor,
            value: interceptedMethod as unknown as typeof descriptor.value,
        };
    };
};
