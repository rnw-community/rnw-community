import type { DecoratedMethodType } from './decorated-method.type';

export type MethodDecoratorType<TResult, TArgs extends unknown[]> = (
    target: object,
    propertyKey: string | symbol,
    descriptor: TypedPropertyDescriptor<DecoratedMethodType<TResult, TArgs>>
    // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
) => TypedPropertyDescriptor<DecoratedMethodType<TResult, TArgs>> | void;
