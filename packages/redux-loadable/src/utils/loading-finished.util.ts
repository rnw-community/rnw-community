import { initialLoadingState } from '../interface/loading-state.interface';

import type { LoadingStateInterface } from '../interface/loading-state.interface';

/**
 * Change loading state slice to loading finished state.
 *
 * @template T
 * @param state Redux state slice
 *
 * @return {T} Mutated state
 */
export const loadingFinished = <T extends LoadingStateInterface>(state: T): T => {
    state.isPristine = false;
    state.isLoading = initialLoadingState.isLoading;
    state.error = initialLoadingState.error;

    return { ...state };
};
