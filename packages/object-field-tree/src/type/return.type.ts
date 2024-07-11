import type { Enum } from '@rnw-community/shared';

export type CombineReturn1<T extends Enum, D> = Record<keyof T, D>;
export type CombineReturn2<D, T1 extends Enum, T2 extends Enum> = Record<keyof T1, CombineReturn1<T2, D>>;
export type CombineReturn3<D, T1 extends Enum, T2 extends Enum, T3 extends Enum> = Record<
    keyof T1,
    CombineReturn2<D, T2, T3>
>;
export type CombineReturn4<D, T1 extends Enum, T2 extends Enum, T3 extends Enum, T4 extends Enum> = Record<
    keyof T1,
    CombineReturn3<D, T2, T3, T4>
>;
export type CombineReturn5<D, T1 extends Enum, T2 extends Enum, T3 extends Enum, T4 extends Enum, T5 extends Enum> = Record<
    keyof T1,
    CombineReturn4<D, T2, T3, T4, T5>
>;
