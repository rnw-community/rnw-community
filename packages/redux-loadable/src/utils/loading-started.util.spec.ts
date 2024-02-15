import { describe, expect, it } from '@jest/globals';

import { initialLoadingState } from '../interface/loading-state.interface';

import { loadingStarted } from './loading-started.util';

import type { LoadingStateInterface } from '../interface/loading-state.interface';

describe('loadingStarted', () => {
    it('should mutate and return loading started state', () => {
        expect.assertions(6);

        const state: LoadingStateInterface = {
            ...initialLoadingState,
        };

        const startedState = loadingStarted(state);

        expect(state.isLoading).toBe(true);
        expect(state.isPristine).toBe(false);
        expect(state.error).toBe('');

        expect(startedState.isLoading).toBe(true);
        expect(startedState.isPristine).toBe(false);
        expect(startedState.error).toBe('');
    });
});
