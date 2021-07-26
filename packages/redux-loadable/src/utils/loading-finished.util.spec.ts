import { initialLoadingState } from '../interface/loading-state.interface';

import { loadingFinished } from './loading-finished.util';

import type { LoadingStateInterface } from '../interface/loading-state.interface';

describe('loadingFinished', () => {
    it('should mutate and return loading finished state', () => {
        expect.assertions(6);

        const state: LoadingStateInterface = {
            ...initialLoadingState,
        };

        const finishedState = loadingFinished(state);

        expect(state.isLoading).toStrictEqual(false);
        expect(state.isPristine).toStrictEqual(false);
        expect(state.error).toStrictEqual('');

        expect(finishedState.isLoading).toStrictEqual(false);
        expect(finishedState.isPristine).toStrictEqual(false);
        expect(finishedState.error).toStrictEqual('');
    });
});
