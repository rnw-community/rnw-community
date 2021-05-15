/**
 * Typeguard defining is passed variable is not undefined and is not null
 *
 * @param value Value for typechecking
 * @returns _True_ if value is not undefined and is not null otherwise _false_
 */
export const isDefined = <T>(value: T | undefined | null): value is T => value !== undefined && value !== null;
