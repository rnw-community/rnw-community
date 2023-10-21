/* eslint-disable @typescript-eslint/no-explicit-any */
export type ClassType<T> = new (...args: any[]) => T;
