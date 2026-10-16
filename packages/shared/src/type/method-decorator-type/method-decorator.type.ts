import type { AnyFn } from '../any-fn-type/any-fn.type';

/**
 * A method decorator typed against the decorated method's signature `K`, for building type-safe decorator factories.
 *
 * @see https://github.com/rnw-community/rnw-community/blob/master/packages/shared/src/type/method-decorator-type/method-decorator.type.md
 */
export type MethodDecoratorType<K extends AnyFn> = (
    target: object,
    propertyKey: string | symbol,
    descriptor: TypedPropertyDescriptor<K>
    // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
) => TypedPropertyDescriptor<K> | void;
