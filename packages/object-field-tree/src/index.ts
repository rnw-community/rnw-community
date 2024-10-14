import type { DataFn1, DataFn2, DataFn3, DataFn4, DataFn5 } from './type/data-fn.type';
import type { CombineReturn1, CombineReturn2, CombineReturn3, CombineReturn4, CombineReturn5 } from './type/return.type';
import type { Enum } from '@rnw-community/shared';

// TODO: Investigate if we can add types without specifying all combinations
export function combine<D, T1 extends Enum>(dataFn: DataFn1<D, T1>, collection1: T1): CombineReturn1<T1, D>;
export function combine<D, T1 extends Enum, T2 extends Enum>(
    dataFn: DataFn2<D, T1, T2>,
    collection1: T1,
    collection2: T2
): CombineReturn2<D, T1, T2>;
export function combine<D, T1 extends Enum, T2 extends Enum, T3 extends Enum>(
    dataFn: DataFn3<D, T1, T2, T3>,
    collection1: T1,
    collection2: T2,
    collection3: T3
): CombineReturn3<D, T1, T2, T3>;
export function combine<D, T1 extends Enum, T2 extends Enum, T3 extends Enum, T4 extends Enum>(
    dataFn: DataFn4<D, T1, T2, T3, T4>,
    collection1: T1,
    collection2: T2,
    collection3: T3,
    collection4: T4
): CombineReturn4<D, T1, T2, T3, T4>;

export function combine<D, T1 extends Enum, T2 extends Enum, T3 extends Enum, T4 extends Enum, T5 extends Enum>(
    dataFn: DataFn5<D, T1, T2, T3, T4, T5>,
    collection1: T1,
    collection2: T2,
    collection3: T3,
    collection4: T4,
    collection5: T5
): CombineReturn5<D, T1, T2, T3, T4, T5>;

// TODO: Introduce non-recursive optimized solution
// eslint-disable-next-line func-style,@typescript-eslint/no-explicit-any
export function combine(dataFn: (...keys: any) => any, ...objects: any[]): any {
    const result = {};

    const obj = objects.shift() as object;
    if (objects.length > 0) {
        for (const key of Object.keys(obj)) {
            // @ts-expect-error Needs improvement
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return,@typescript-eslint/no-unsafe-argument,@typescript-eslint/no-explicit-any
            result[key] = combine((...args: any[]) => dataFn(key, ...args), ...objects);
        }
    } else {
        for (const key of Object.keys(obj)) {
            // @ts-expect-error Needs improvement
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            result[key] = dataFn(key);
        }
    }

    return result;
}

export type { Enum };
export type { CombineReturn1, CombineReturn2, CombineReturn3, CombineReturn4, CombineReturn5 } from './type/return.type';
