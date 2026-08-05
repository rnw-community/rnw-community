import { describe, expect, it } from '@jest/globals';

import { initialLoadingState } from '../interface/loading-state.interface.js';

import { loadingFinished } from './loading-finished.util.js';

import type { LoadingStateInterface } from '../interface/loading-state.interface.js';

describe('loadingFinished', () => {
    it('should mutate and return loading finished state', () => {
        expect.assertions(6);

        const state: LoadingStateInterface = {
            ...initialLoadingState,
        };

        const finishedState = loadingFinished(state);

        expect(state.isLoading).toBe(initialLoadingState.isLoading);
        expect(state.isPristine).toBe(false);
        expect(state.error).toBe('');

        expect(finishedState.isLoading).toBe(initialLoadingState.isLoading);
        expect(finishedState.isPristine).toBe(false);
        expect(finishedState.error).toBe('');
    });
});
