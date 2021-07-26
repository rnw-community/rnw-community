import { initialLoadingState } from '../interface/loading-state.interface';

import type { LoadingStateInterface } from '../interface/loading-state.interface';

export const loadingFailed = <T extends LoadingStateInterface>(state: T, error: string): T => {
    state.isPristine = false;
    state.isLoading = initialLoadingState.isLoading;
    state.error = error;

    return state;
};
