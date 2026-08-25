import { describe, expect, it } from '@jest/globals';

import { getScreenChromeHeaderMetrics } from './get-screen-chrome-header-metrics.util';

const HEADER_HEIGHT = 64;
const INSETS_TOP = 10;
const LARGE_INSETS_TOP = 59;
const EXTRA_TOP_INSET = 10;
const NO_INSETS_TOP = 0;

describe('getScreenChromeHeaderMetrics', () => {
    it('adds the device top inset to the configured header height', () => {
        expect.hasAssertions();

        expect(getScreenChromeHeaderMetrics(HEADER_HEIGHT, INSETS_TOP)).toBe(HEADER_HEIGHT + INSETS_TOP);
    });

    it('adds an explicit header top inset on top of the safe area', () => {
        expect.hasAssertions();

        expect(getScreenChromeHeaderMetrics(HEADER_HEIGHT, INSETS_TOP, EXTRA_TOP_INSET)).toBe(
            HEADER_HEIGHT + INSETS_TOP + EXTRA_TOP_INSET
        );
    });

    it('returns the bare header height when no top inset is reported', () => {
        expect.hasAssertions();

        expect(getScreenChromeHeaderMetrics(HEADER_HEIGHT, NO_INSETS_TOP)).toBe(HEADER_HEIGHT);
        expect(getScreenChromeHeaderMetrics(HEADER_HEIGHT, LARGE_INSETS_TOP)).toBe(HEADER_HEIGHT + LARGE_INSETS_TOP);
    });
});
