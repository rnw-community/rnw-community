/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * A concrete class constructor producing instances of `T`, for typing `instanceof` checks and constructor arguments.
 *
 * @see https://github.com/rnw-community/rnw-community/blob/master/packages/shared/src/type/class-type/class.type.md
 */
export type ClassType<T> = new (...args: any[]) => T;
