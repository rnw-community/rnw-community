import { describe, expect, it } from '@jest/globals';

import { emptyFn } from '../../../util/empty-fn/empty-fn';

import { isPromise } from './is-promise';

describe('isPromise', () => {
    it('should return true if variable is Promise', () => {
        expect.hasAssertions();

        expect(isPromise(Promise.resolve(true))).toBe(true);
        expect(isPromise(new Promise(emptyFn))).toBe(true);
        expect(isPromise({ then: emptyFn })).toBe(true);
    });

    it('should return false if variable is not a Promise', () => {
        expect.hasAssertions();

        expect(isPromise(null)).toBe(false);
        expect(isPromise({})).toBe(false);
        expect(isPromise(1)).toBe(false);
        expect(isPromise(undefined)).toBe(false);
        expect(isPromise(emptyFn)).toBe(false);
    });
});
