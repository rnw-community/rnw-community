import type { DecoratedMethodType } from './decorated-method.type';

export type MethodDecoratorType<TResult, TArgs extends unknown[]> = (
    target: object,
    propertyKey: string | symbol,
    descriptor: TypedPropertyDescriptor<DecoratedMethodType<TResult, TArgs>>
) => TypedPropertyDescriptor<DecoratedMethodType<TResult, TArgs>>;
