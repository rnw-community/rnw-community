import { describe, expect, it } from '@jest/globals';

import { initialLoadingState } from '../interface/loading-state.interface';

import { loadingStateSelector } from './loading-state.selector';

describe('loadingStateSelector', () => {
    it('should return loading state tuple by slice name', () => {
        expect.assertions(4);

        const state = {
            testSlice: { ...initialLoadingState },
        };

        const sliceSelector = loadingStateSelector('testSlice');
        const [isLoading, isFailed, isPristine, error] = sliceSelector(state);

        expect(isLoading).toStrictEqual(state.testSlice.isLoading);
        expect(isFailed).toBe(false);
        expect(isPristine).toStrictEqual(state.testSlice.isPristine);
        expect(error).toStrictEqual(state.testSlice.error);
    });
});
