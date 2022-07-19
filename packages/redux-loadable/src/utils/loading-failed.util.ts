import { initialLoadingState } from '../interface/loading-state.interface';

import type { LoadingStateInterface } from '../interface/loading-state.interface';

/**
 * Change loading state slice to loading failed state.
 *
 * @template T
 * @param state Redux state slice
 * @param errorReason Loading failure reason
 *
 * @return {T} state
 */
export const loadingFailed = <T extends LoadingStateInterface>(state: T, errorReason: string): T => {
    state.isPristine = false;
    state.isLoading = initialLoadingState.isLoading;
    state.error = errorReason;

    return { ...state };
};
