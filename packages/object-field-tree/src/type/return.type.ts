import type { Enum } from '@rnw-community/shared';

export type Return1<T extends Enum, D> = Record<keyof T, D>;
export type Return2<D, T1 extends Enum, T2 extends Enum> = Record<keyof T1, Return1<T2, D>>;
export type Return3<D, T1 extends Enum, T2 extends Enum, T3 extends Enum> = Record<keyof T1, Return2<D, T2, T3>>;
export type Return4<D, T1 extends Enum, T2 extends Enum, T3 extends Enum, T4 extends Enum> = Record<
    keyof T1,
    Return3<D, T2, T3, T4>
>;
export type Return5<D, T1 extends Enum, T2 extends Enum, T3 extends Enum, T4 extends Enum, T5 extends Enum> = Record<
    keyof T1,
    Return4<D, T2, T3, T4, T5>
>;
