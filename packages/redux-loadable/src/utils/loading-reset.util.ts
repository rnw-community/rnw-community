import { initialLoadingState } from '../interface/loading-state.interface';

import type { LoadingStateInterface } from '../interface/loading-state.interface';

/**
 * Reducer helper restoring a slice's loading fields to `initialLoadingState`.
 *
 * @see https://github.com/rnw-community/rnw-community/blob/master/packages/redux-loadable/readme.md#loadingresetstate
 */
export const loadingReset = <T extends LoadingStateInterface>(state: T): T => {
    state.isPristine = initialLoadingState.isPristine;
    state.isLoading = initialLoadingState.isLoading;
    state.error = initialLoadingState.error;

    return { ...state };
};
