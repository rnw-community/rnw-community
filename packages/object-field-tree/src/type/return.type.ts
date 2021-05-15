import type { Enum } from './enum.type';

export type Return1<T extends Enum, D> = Record<keyof T, D>;
export type Return2<D, T1 extends Enum, T2 extends Enum> = Record<keyof T1, Return1<T2, D>>;
export type Return3<D, T1 extends Enum, T2 extends Enum, T3 extends Enum> = Record<keyof T1, Return2<D, T2, T3>>;
export type Return4<D, T1 extends Enum, T2 extends Enum, T3 extends Enum, T4 extends Enum> = Record<
    keyof T1,
    Return3<D, T2, T3, T4>
>;
