import type { Enum } from '@rnw-community/shared';

export type DataFn1<D, T1 extends Enum> = (t1: keyof T1) => D;
export type DataFn2<D, T1 extends Enum, T2 extends Enum> = (t1: keyof T1, t2: keyof T2) => D;
export type DataFn3<D, T1 extends Enum, T2 extends Enum, T3 extends Enum> = (t1: keyof T1, t2: keyof T2, t3: keyof T3) => D;
export type DataFn4<D, T1 extends Enum, T2 extends Enum, T3 extends Enum, T4 extends Enum> = (
    t1: keyof T1,
    t2: keyof T2,
    t3: keyof T3,
    t4: keyof T4
) => D;
// eslint-disable-next-line @typescript-eslint/max-params
export type DataFn5<D, T1 extends Enum, T2 extends Enum, T3 extends Enum, T4 extends Enum, T5 extends Enum> = (
    t1: keyof T1,
    t2: keyof T2,
    t3: keyof T3,
    t4: keyof T4,
    t5: keyof T5
) => D;
