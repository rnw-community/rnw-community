import { initialLoadingState } from '../interface/loading-state.interface.js';

import type { LoadingStateInterface } from '../interface/loading-state.interface.js';

export const loadingStarted = <T extends LoadingStateInterface>(state: T): T => {
    state.isPristine = false;
    state.isLoading = true;
    state.error = initialLoadingState.error;

    return { ...state };
};
