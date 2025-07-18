// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type MethodDecoratorType<K extends (...args: any) => any> = (
    target: object,
    propertyKey: string | symbol,
    descriptor: TypedPropertyDescriptor<K>
    // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
) => TypedPropertyDescriptor<K> | void;
