import { initialLoadingState } from '../interface/loading-state.interface';

import { loadingReset } from './loading-reset.util';

import type { LoadingStateInterface } from '../interface/loading-state.interface';

describe('loadingReset', () => {
    it('should mutate and return loading initial state', () => {
        expect.assertions(6);

        const state: LoadingStateInterface = {
            ...initialLoadingState,
            isPristine: false,
            error: 'Test error',
        };

        const finishedState = loadingReset(state);

        expect(state.isLoading).toBe(initialLoadingState.isLoading);
        expect(state.isPristine).toBe(initialLoadingState.isPristine);
        expect(state.error).toBe(initialLoadingState.error);

        expect(finishedState.isLoading).toBe(initialLoadingState.isLoading);
        expect(finishedState.isPristine).toBe(initialLoadingState.isPristine);
        expect(finishedState.error).toBe(initialLoadingState.error);
    });
});
