import { initialLoadingState } from '../interface/loading-state.interface';

import type { LoadingStateInterface } from '../interface/loading-state.interface';

/**
 * Reset loading state slice to loading initial state.
 *
 * @template T
 * @param state Redux state slice
 *
 * @return {T} Mutated state
 */
export const loadingReset = <T extends LoadingStateInterface>(state: T): T => {
    state.isPristine = initialLoadingState.isPristine;
    state.isLoading = initialLoadingState.isLoading;
    state.error = initialLoadingState.error;

    return { ...state };
};
