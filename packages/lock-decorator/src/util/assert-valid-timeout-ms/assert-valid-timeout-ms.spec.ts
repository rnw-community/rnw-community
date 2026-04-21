import { describe, expect, it } from '@jest/globals';

import { assertValidTimeoutMs } from './assert-valid-timeout-ms';

describe('assertValidTimeoutMs', () => {
    it('accepts undefined (no timeout)', () => {
        expect.hasAssertions();
        expect(() => {
            assertValidTimeoutMs(void 0);
        }).not.toThrow();
    });

    it('accepts a positive finite number', () => {
        expect.hasAssertions();
        expect(() => {
            assertValidTimeoutMs(1);
        }).not.toThrow();
        expect(() => {
            assertValidTimeoutMs(1000);
        }).not.toThrow();
        expect(() => {
            assertValidTimeoutMs(Number.MAX_SAFE_INTEGER);
        }).not.toThrow();
    });

    it('rejects zero with TypeError including received value', () => {
        expect.hasAssertions();
        expect(() => {
            assertValidTimeoutMs(0);
        }).toThrow(TypeError);
        expect(() => {
            assertValidTimeoutMs(0);
        }).toThrow('received 0');
    });

    it('rejects negative values', () => {
        expect.hasAssertions();
        expect(() => {
            assertValidTimeoutMs(-1);
        }).toThrow(TypeError);
        expect(() => {
            assertValidTimeoutMs(-1);
        }).toThrow('received -1');
    });

    it('rejects NaN', () => {
        expect.hasAssertions();
        expect(() => {
            assertValidTimeoutMs(Number.NaN);
        }).toThrow(TypeError);
        expect(() => {
            assertValidTimeoutMs(Number.NaN);
        }).toThrow('received NaN');
    });

    it('rejects Infinity', () => {
        expect.hasAssertions();
        expect(() => {
            assertValidTimeoutMs(Number.POSITIVE_INFINITY);
        }).toThrow(TypeError);
        expect(() => {
            assertValidTimeoutMs(Number.POSITIVE_INFINITY);
        }).toThrow('received Infinity');
    });

    it('rejects -Infinity', () => {
        expect.hasAssertions();
        expect(() => {
            assertValidTimeoutMs(Number.NEGATIVE_INFINITY);
        }).toThrow(TypeError);
    });
});
