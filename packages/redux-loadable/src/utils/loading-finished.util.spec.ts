import { initialLoadingState } from '../interface/loading-state.interface';

import { loadingFinished } from './loading-finished.util';

import type { LoadingStateInterface } from '../interface/loading-state.interface';

describe('loadingFinished', () => {
    it('should mutate and return loading finished state', () => {
        expect.assertions(6);

        const state: LoadingStateInterface = {
            ...initialLoadingState,
        };

        const failedState = loadingFinished(state);

        expect(state.isLoading).toStrictEqual(false);
        expect(state.isPristine).toStrictEqual(false);
        expect(state.error).toStrictEqual('');

        expect(failedState.isLoading).toStrictEqual(false);
        expect(failedState.isPristine).toStrictEqual(false);
        expect(failedState.error).toStrictEqual('');
    });
});
