import { describe, expect, it } from '@jest/globals';

import { isPromiseLike } from './is-promise';

describe('isPromiseLike', () => {
    it('accepts real Promises', () => {
        expect(isPromiseLike(Promise.resolve())).toBe(true);
    });

    it('accepts object and function thenables', () => {
        expect(isPromiseLike({ then: () => undefined })).toBe(true);
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        const fn = (): void => {};
        (fn as unknown as { then: () => void }).then = () => undefined;
        expect(isPromiseLike(fn)).toBe(true);
    });

    it('rejects non-thenables and primitives', () => {
        expect(isPromiseLike(null)).toBe(false);
        expect(isPromiseLike(undefined)).toBe(false);
        expect(isPromiseLike(0)).toBe(false);
        expect(isPromiseLike('')).toBe(false);
        expect(isPromiseLike({})).toBe(false);
        expect(isPromiseLike({ then: 42 })).toBe(false);
    });
});
