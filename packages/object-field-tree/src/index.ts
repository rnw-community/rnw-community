/* eslint-disable no-implicit-globals */
import type { DataFn1, DataFn2, DataFn3, DataFn4, DataFn5 } from './type/data-fn.type';
import type { CombineReturn1, CombineReturn2, CombineReturn3, CombineReturn4, CombineReturn5 } from './type/return.type';
import type { Enum } from '@rnw-community/shared';

/**
 * Builds an object over the keys of one enum-like collection whose values are `dataFn(key)`.
 *
 * @see https://github.com/rnw-community/rnw-community/blob/master/packages/object-field-tree/readme.md#combine
 */
export function combine<D, T1 extends Enum>(dataFn: DataFn1<D, T1>, collection1: T1): CombineReturn1<T1, D>;
/**
 * Builds a two-level nested object over the keys of two enum-like collections whose leaves are `dataFn(key1, key2)`.
 *
 * @see https://github.com/rnw-community/rnw-community/blob/master/packages/object-field-tree/readme.md#combine
 */
export function combine<D, T1 extends Enum, T2 extends Enum>(
    dataFn: DataFn2<D, T1, T2>,
    collection1: T1,
    collection2: T2
): CombineReturn2<D, T1, T2>;
/**
 * Builds a three-level nested object over the keys of three enum-like collections whose leaves are `dataFn(key1, key2, key3)`.
 *
 * @see https://github.com/rnw-community/rnw-community/blob/master/packages/object-field-tree/readme.md#combine
 */
export function combine<D, T1 extends Enum, T2 extends Enum, T3 extends Enum>(
    dataFn: DataFn3<D, T1, T2, T3>,
    collection1: T1,
    collection2: T2,
    collection3: T3
): CombineReturn3<D, T1, T2, T3>;
/**
 * Builds a four-level nested object over the keys of four enum-like collections whose leaves are `dataFn(key1, …, key4)`.
 *
 * @see https://github.com/rnw-community/rnw-community/blob/master/packages/object-field-tree/readme.md#combine
 */
// eslint-disable-next-line @typescript-eslint/max-params
export function combine<D, T1 extends Enum, T2 extends Enum, T3 extends Enum, T4 extends Enum>(
    dataFn: DataFn4<D, T1, T2, T3, T4>,
    collection1: T1,
    collection2: T2,
    collection3: T3,
    collection4: T4
): CombineReturn4<D, T1, T2, T3, T4>;

/**
 * Builds a five-level nested object over the keys of five enum-like collections whose leaves are `dataFn(key1, …, key5)`.
 *
 * @see https://github.com/rnw-community/rnw-community/blob/master/packages/object-field-tree/readme.md#combine
 */
// eslint-disable-next-line @typescript-eslint/max-params
export function combine<D, T1 extends Enum, T2 extends Enum, T3 extends Enum, T4 extends Enum, T5 extends Enum>(
    dataFn: DataFn5<D, T1, T2, T3, T4, T5>,
    collection1: T1,
    collection2: T2,
    collection3: T3,
    collection4: T4,
    collection5: T5
): CombineReturn5<D, T1, T2, T3, T4, T5>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function combine(dataFn: (...keys: any) => any, ...objects: any[]): any {
    const result = {};

    const obj = objects.shift() as object;
    if (objects.length > 0) {
        for (const key of Object.keys(obj)) {
            // @ts-expect-error no index signature on result
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return,@typescript-eslint/no-unsafe-argument,@typescript-eslint/no-explicit-any
            result[key] = combine((...args: any[]) => dataFn(key, ...args), ...objects);
        }
    } else {
        for (const key of Object.keys(obj)) {
            // @ts-expect-error no index signature on result
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            result[key] = dataFn(key);
        }
    }

    return result;
}

export type { Enum };
export type { CombineReturn1, CombineReturn2, CombineReturn3, CombineReturn4, CombineReturn5 } from './type/return.type';
