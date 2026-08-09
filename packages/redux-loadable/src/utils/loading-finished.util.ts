import { initialLoadingState } from '../interface/loading-state.interface.js';

import type { LoadingStateInterface } from '../interface/loading-state.interface.js';

export const loadingFinished = <T extends LoadingStateInterface>(state: T): T => {
    state.isPristine = false;
    state.isLoading = initialLoadingState.isLoading;
    state.error = initialLoadingState.error;

    return { ...state };
};
