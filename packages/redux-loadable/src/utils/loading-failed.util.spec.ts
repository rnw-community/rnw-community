import { describe, expect, it } from '@jest/globals';

import { initialLoadingState } from '../interface/loading-state.interface.js';

import { loadingFailed } from './loading-failed.util.js';

import type { LoadingStateInterface } from '../interface/loading-state.interface.js';

describe('loadingFailed', () => {
    it('should mutate and return loading failed state', () => {
        expect.assertions(6);

        const state: LoadingStateInterface = {
            ...initialLoadingState,
        };

        const failedState = loadingFailed(state, 'error');

        expect(state.isLoading).toBe(initialLoadingState.isLoading);
        expect(state.isPristine).toBe(false);
        expect(state.error).toBe('error');

        expect(failedState.isLoading).toBe(initialLoadingState.isLoading);
        expect(failedState.isPristine).toBe(false);
        expect(failedState.error).toBe('error');
    });
});
