import { initialLoadingState } from '../interface/loading-state.interface';

import { loadingReset } from './loading-reset.util';

import type { LoadingStateInterface } from '../interface/loading-state.interface';

describe('loadingReset', () => {
    it('should mutate and return loading initial state', () => {
        expect.assertions(6);

        const state: LoadingStateInterface = {
            ...initialLoadingState,
        };

        const finishedState = loadingReset(state);

        expect(state.isLoading).toBe(false);
        expect(state.isPristine).toBe(true);
        expect(state.error).toBe('');

        expect(finishedState.isLoading).toBe(false);
        expect(finishedState.isPristine).toBe(true);
        expect(finishedState.error).toBe('');
    });
});
