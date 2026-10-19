/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * A function type matching any signature, for constraining generic type parameters that must be callable.
 *
 * @see https://github.com/rnw-community/rnw-community/blob/master/packages/shared/src/type/any-fn-type/any-fn.type.md
 */
export type AnyFn = (...args: any) => any;
