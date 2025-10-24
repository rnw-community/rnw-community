/**
 * Typeguard defining is passed variable is not undefined and is not null
 *
 * @param value Value for typechecking
 * @returns _True_ if value is not undefined and is not null otherwise _false_
 */
// eslint-disable-next-line no-undefined
export const isDefined = <T>(value: T | null | undefined): value is T => value !== undefined && value !== null;
