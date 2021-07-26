import { initialLoadingState } from '../interface/loading-state.interface';

import type { LoadingStateInterface } from '../interface/loading-state.interface';

export const loadingFinished = <T extends LoadingStateInterface>(state: T): T => {
    state.isPristine = false;
    state.isLoading = initialLoadingState.isLoading;
    state.error = initialLoadingState.error;

    return state;
};
