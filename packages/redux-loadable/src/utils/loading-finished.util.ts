import { initialLoadingState } from '../interface/loading-state.interface';

import type { LoadingStateInterface } from '../interface/loading-state.interface';

/**
 * Reducer helper marking a slice's request as successfully finished, clearing its loading flag and error.
 *
 * @see https://github.com/rnw-community/rnw-community/blob/master/packages/redux-loadable/readme.md#loadingfinishedstate
 */
export const loadingFinished = <T extends LoadingStateInterface>(state: T): T => {
    state.isPristine = false;
    state.isLoading = initialLoadingState.isLoading;
    state.error = initialLoadingState.error;

    return { ...state };
};
