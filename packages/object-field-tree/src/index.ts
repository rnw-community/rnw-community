/* eslint-disable @typescript-eslint/no-explicit-any,@typescript-eslint/ban-types,@typescript-eslint/ban-ts-comment */
import type { DataFn1, DataFn2, DataFn3, DataFn4 } from './type/data-fn.type';
import type { Enum } from './type/enum.type';
import type { Return1, Return2, Return3, Return4 } from './type/return.type';

// TODO: Investigate if we can add types without specifying all combinations
export function combine<D, T1 extends Enum>(dataFn: DataFn1<D, T1>, collection1: T1): Return1<T1, D>;
export function combine<D, T1 extends Enum, T2 extends Enum>(
    dataFn: DataFn2<D, T1, T2>,
    collection1: T1,
    collection2: T2
): Return2<D, T1, T2>;
export function combine<D, T1 extends Enum, T2 extends Enum, T3 extends Enum>(
    dataFn: DataFn3<D, T1, T2, T3>,
    collection1: T1,
    collection2: T2,
    collection3: T3
): Return3<D, T1, T2, T3>;
export function combine<D, T1 extends Enum, T2 extends Enum, T3 extends Enum, T4 extends Enum>(
    dataFn: DataFn4<D, T1, T2, T3, T4>,
    collection1: T1,
    collection2: T2,
    collection3: T3,
    collection4: T4
): Return4<D, T1, T2, T3, T4>;

// TODO: Introduce non-recursive optimized solution
// eslint-disable-next-line func-style
export function combine(dataFn: (...keys: any) => any, ...objects: any[]): any {
    const result = {};

    const obj = objects.shift() as object;
    if (objects.length > 0) {
        for (const key of Object.keys(obj)) {
            // @ts-expect-error
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return,@typescript-eslint/no-unsafe-argument
            result[key] = combine((...args: any[]) => dataFn(key, ...args), ...objects);
        }
    } else {
        for (const key of Object.keys(obj)) {
            // @ts-expect-error
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            result[key] = dataFn(key);
        }
    }

    return result;
}

export type { Enum };
