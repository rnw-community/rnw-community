/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * An abstract class constructor producing instances of `T`, for referencing abstract classes as values such as DI tokens.
 *
 * @see https://github.com/rnw-community/rnw-community/blob/master/packages/shared/src/type/abstract-constructor-type/abstract-constructor.type.md
 */
export type AbstractConstructor<T = object> = abstract new (...args: any[]) => T;
