/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * A function type accepting any arguments and returning `void`, for callbacks whose result is ignored.
 *
 * @see https://github.com/rnw-community/rnw-community/blob/master/packages/shared/src/type/empty-fn-type/empty-fn.type.md
 */
export type EmptyFn = (...args: any[]) => void;
