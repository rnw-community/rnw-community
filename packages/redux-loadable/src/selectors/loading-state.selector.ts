import type { LoadingStateSliceSelector } from './loading-state-slice-selector.type';

/**
 * Creates a selector for a state slice that returns its `[isLoading, isFailed, isPristine, errorText]` tuple.
 *
 * @see https://github.com/rnw-community/rnw-community/blob/master/packages/redux-loadable/readme.md#loadingstateselectorslice
 */
export const loadingStateSelector: LoadingStateSliceSelector<
    [isLoading: boolean, isFailed: boolean, isPristine: boolean, errorText: string]
> = slice => state => [state[slice].isLoading, state[slice].error !== '', state[slice].isPristine, state[slice].error];
