export type MethodDecoratorType = <T extends (this: unknown, ...args: readonly never[]) => unknown>(
    target: object,
    propertyKey: string | symbol,
    descriptor: TypedPropertyDescriptor<T>
) => TypedPropertyDescriptor<T>;
