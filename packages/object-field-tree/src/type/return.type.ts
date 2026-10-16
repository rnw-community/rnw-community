import type { Enum } from '@rnw-community/shared';

/**
 * The return type of `combine` with one collection, mapping each key of `T` to a leaf of type `D`.
 *
 * @see https://github.com/rnw-community/rnw-community/blob/master/packages/object-field-tree/readme.md#combinereturn1t-d
 */
export type CombineReturn1<T extends Enum, D> = Record<keyof T, D>;
/**
 * The return type of `combine` with two collections, nesting a `CombineReturn1` under each key of `T1`.
 *
 * @see https://github.com/rnw-community/rnw-community/blob/master/packages/object-field-tree/readme.md#combinereturn2d-t1-t2
 */
export type CombineReturn2<D, T1 extends Enum, T2 extends Enum> = Record<keyof T1, CombineReturn1<T2, D>>;
/**
 * The return type of `combine` with three collections, nesting a `CombineReturn2` under each key of `T1`.
 *
 * @see https://github.com/rnw-community/rnw-community/blob/master/packages/object-field-tree/readme.md#combinereturn3d-t1-t2-t3
 */
export type CombineReturn3<D, T1 extends Enum, T2 extends Enum, T3 extends Enum> = Record<
    keyof T1,
    CombineReturn2<D, T2, T3>
>;
/**
 * The return type of `combine` with four collections, nesting a `CombineReturn3` under each key of `T1`.
 *
 * @see https://github.com/rnw-community/rnw-community/blob/master/packages/object-field-tree/readme.md#combinereturn4d-t1-t2-t3-t4
 */
export type CombineReturn4<D, T1 extends Enum, T2 extends Enum, T3 extends Enum, T4 extends Enum> = Record<
    keyof T1,
    CombineReturn3<D, T2, T3, T4>
>;
/**
 * The return type of `combine` with five collections, nesting a `CombineReturn4` under each key of `T1`.
 *
 * @see https://github.com/rnw-community/rnw-community/blob/master/packages/object-field-tree/readme.md#combinereturn5d-t1-t2-t3-t4-t5
 */
export type CombineReturn5<D, T1 extends Enum, T2 extends Enum, T3 extends Enum, T4 extends Enum, T5 extends Enum> = Record<
    keyof T1,
    CombineReturn4<D, T2, T3, T4, T5>
>;
