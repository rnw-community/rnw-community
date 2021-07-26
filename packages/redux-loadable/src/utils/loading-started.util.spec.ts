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

        expect(state.isLoading).toStrictEqual(true);
        expect(state.isPristine).toStrictEqual(false);
        expect(state.error).toStrictEqual('');

        expect(startedState.isLoading).toStrictEqual(true);
        expect(startedState.isPristine).toStrictEqual(false);
        expect(startedState.error).toStrictEqual('');
    });
});
