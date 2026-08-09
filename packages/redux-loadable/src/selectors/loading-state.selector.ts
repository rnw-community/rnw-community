import type { LoadingStateSliceSelector } from './loading-state-slice-selector.type.js';

export const loadingStateSelector: LoadingStateSliceSelector<
    [isLoading: boolean, isFailed: boolean, isPristine: boolean, errorText: string]
> = slice => state => [state[slice].isLoading, state[slice].error !== '', state[slice].isPristine, state[slice].error];
