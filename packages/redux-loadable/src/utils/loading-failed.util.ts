import { initialLoadingState } from '../interface/loading-state.interface';

import type { LoadingStateInterface } from '../interface/loading-state.interface';

export const loadingFailed = <T extends LoadingStateInterface>(state: T, errorReason: string): T => {
    state.isPristine = false;
    state.isLoading = initialLoadingState.isLoading;
    state.error = errorReason;

    return { ...state };
};
