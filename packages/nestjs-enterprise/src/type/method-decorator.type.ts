import type { AnyFn } from '@rnw-community/shared';

export type MethodDecoratorType<K extends AnyFn> = (
    target: object,
    propertyKey: string | symbol,
    descriptor: TypedPropertyDescriptor<K>
    // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
) => TypedPropertyDescriptor<K> | void;
