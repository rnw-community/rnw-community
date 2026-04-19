import type { InterceptorInterface } from '../type/interceptor.interface';
import type { ResultStrategyInterface } from '../type/result-strategy.interface';
import { buildContext } from './build-context';
import { runInterception } from './run-interception';

export interface CreateLegacyInterceptorOptionsInterface<TArgs extends readonly unknown[], TResult> {
    readonly interceptor: InterceptorInterface<TArgs, TResult>;
    readonly strategies?: readonly ResultStrategyInterface[];
}

export type LegacyMethodDecoratorType = <T extends (this: unknown, ...args: readonly never[]) => unknown>(
    target: object,
    propertyKey: string | symbol,
    descriptor: TypedPropertyDescriptor<T>
) => TypedPropertyDescriptor<T>;

export const createLegacyInterceptor = <TArgs extends readonly unknown[], TResult>(
    options: CreateLegacyInterceptorOptionsInterface<TArgs, TResult>
): LegacyMethodDecoratorType => {
    const strategies = options.strategies ?? [];

    return (target, propertyKey, descriptor) => {
        const methodName = String(propertyKey);
        const fallbackClassName =
            typeof (target as { readonly constructor?: { readonly name?: string } }).constructor?.name === 'string'
                ? (target as { readonly constructor: { readonly name: string } }).constructor.name
                : 'Object';

        const originalMethod = descriptor.value;
        if (typeof originalMethod !== 'function') {
            return descriptor;
        }

        const interceptedMethod = function interceptedMethod(this: unknown, ...args: TArgs): TResult {
            const execContext = buildContext(this, fallbackClassName, methodName, args);
            const self = this;
            return runInterception(options.interceptor, strategies, execContext, () =>
                (originalMethod as unknown as (this: unknown, ...methodArgs: unknown[]) => TResult).apply(self, [...args])
            );
        };

        return {
            ...descriptor,
            value: interceptedMethod as unknown as typeof descriptor.value,
        };
    };
};
