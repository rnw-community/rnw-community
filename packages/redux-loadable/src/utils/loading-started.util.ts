import { initialLoadingState } from '../interface/loading-state.interface';

import type { LoadingStateInterface } from '../interface/loading-state.interface';

/**
 * Reducer helper marking a slice as loading, clearing its error and pristine flag, for use inside Redux Toolkit reducers.
 *
 * @see https://github.com/rnw-community/rnw-community/blob/master/packages/redux-loadable/readme.md#loadingstartedstate
 */
export const loadingStarted = <T extends LoadingStateInterface>(state: T): T => {
    state.isPristine = false;
    state.isLoading = true;
    state.error = initialLoadingState.error;

    return { ...state };
};
