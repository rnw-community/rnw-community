import { initialLoadingState } from '../interface/loading-state.interface';

import type { LoadingStateInterface } from '../interface/loading-state.interface';

/**
 * Reducer helper marking a slice's request as failed, clearing its loading flag and storing `errorReason`.
 *
 * @see https://github.com/rnw-community/rnw-community/blob/master/packages/redux-loadable/readme.md#loadingfailedstate-errorreason
 */
export const loadingFailed = <T extends LoadingStateInterface>(state: T, errorReason: string): T => {
    state.isPristine = false;
    state.isLoading = initialLoadingState.isLoading;
    state.error = errorReason;

    return { ...state };
};
