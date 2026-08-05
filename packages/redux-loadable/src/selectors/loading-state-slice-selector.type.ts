import type { LoadingStateInterface } from '../interface/loading-state.interface.js';

export type LoadingStateSliceSelector<R = LoadingStateInterface> = <S extends Record<string, LoadingStateInterface>>(
    slice: keyof S
) => (state: S) => R;
