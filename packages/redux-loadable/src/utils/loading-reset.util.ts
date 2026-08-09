import { initialLoadingState } from '../interface/loading-state.interface.js';

import type { LoadingStateInterface } from '../interface/loading-state.interface.js';

export const loadingReset = <T extends LoadingStateInterface>(state: T): T => {
    state.isPristine = initialLoadingState.isPristine;
    state.isLoading = initialLoadingState.isLoading;
    state.error = initialLoadingState.error;

    return { ...state };
};
