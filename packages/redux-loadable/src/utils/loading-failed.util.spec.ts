import { initialLoadingState } from '../interface/loading-state.interface';

import { loadingFailed } from './loading-failed.util';

import type { LoadingStateInterface } from '../interface/loading-state.interface';

describe('loadingFailed', () => {
    it('should mutate and return loading failed state', () => {
        expect.assertions(6);

        const state: LoadingStateInterface = {
            ...initialLoadingState,
        };

        const failedState = loadingFailed(state, 'error');

        expect(state.isLoading).toStrictEqual(false);
        expect(state.isPristine).toStrictEqual(false);
        expect(state.error).toStrictEqual('error');

        expect(finishedState.isLoading).toStrictEqual(false);
        expect(finishedState.isPristine).toStrictEqual(false);
        expect(finishedState.error).toStrictEqual('error');
    });
});
