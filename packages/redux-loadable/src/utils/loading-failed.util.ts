import { initialLoadingState } from '../interface/loading-state.interface.js';

import type { LoadingStateInterface } from '../interface/loading-state.interface.js';

export const loadingFailed = <T extends LoadingStateInterface>(state: T, errorReason: string): T => {
    state.isPristine = false;
    state.isLoading = initialLoadingState.isLoading;
    state.error = errorReason;

    return { ...state };
};
