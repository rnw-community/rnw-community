/**
 * Type guard narrowing a value to an `Error` instance, typically an `unknown` caught in a `try/catch` block.
 *
 * @see https://github.com/rnw-community/rnw-community/blob/master/packages/shared/src/type-guard/generic/is-error/is-error.md
 */
export const isError = (error: unknown): error is Error => error instanceof Error;
