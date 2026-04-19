export type PromiseLegacyMethodDecoratorType = <
    T extends (this: unknown, ...args: readonly never[]) => Promise<unknown>,
>(
    target: object,
    propertyKey: string | symbol,
    descriptor: TypedPropertyDescriptor<T>
) => TypedPropertyDescriptor<T>;
