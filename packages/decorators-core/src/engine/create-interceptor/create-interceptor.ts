import { buildContext } from '../build-context/build-context';
import { runInterception } from '../run-interception/run-interception';

import type { CreateInterceptorOptionsInterface } from '../../interface/create-interceptor-options.interface';
import type { MethodDecoratorType } from '../../type/method-decorator.type';

const resolveFallbackClassName = (target: object): string => {
    if (typeof target === 'function') {
        const { name } = (target as { readonly name?: string });
        if (typeof name === 'string' && name.length > 0) {
            return name;
        }
    }
    const ctorName = (target as { readonly constructor?: { readonly name?: string } }).constructor?.name;

    return typeof ctorName === 'string' && ctorName.length > 0 ? ctorName : 'Object';
};

export const createInterceptor = <TArgs extends readonly unknown[], TResult>(
    options: CreateInterceptorOptionsInterface<TArgs, TResult>
): MethodDecoratorType => {
    const strategies = options.strategies ?? [];

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
