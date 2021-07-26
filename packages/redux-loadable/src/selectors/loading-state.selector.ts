import type { LoadingStateSliceSelector } from './loading-state-slice-selector.type';

/**
 * Redux selector for loading state
 *
 * @param slice Redux state slice name, that extends LoadingStateInterface
 *
 * @return {[isLoading: boolean, isFailed: boolean, isPristine: boolean, errorText: string]} Loading state tuple
 */
export const loadingStateSelector: LoadingStateSliceSelector<
    [isLoading: boolean, isFailed: boolean, isPristine: boolean, errorText: string]
> = slice => state => [state[slice].isLoading, state[slice].error !== '', state[slice].isPristine, state[slice].error];
