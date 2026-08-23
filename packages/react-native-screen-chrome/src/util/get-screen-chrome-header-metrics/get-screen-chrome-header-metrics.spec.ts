import { describe, expect, it } from '@jest/globals';

import { getScreenChromeHeaderMetrics } from './get-screen-chrome-header-metrics.util';

const HEADER_HEIGHT = 64;
const INSETS_TOP = 10;
const LARGE_INSETS_TOP = 59;
const NO_INSETS_TOP = 0;

describe('getScreenChromeHeaderMetrics', () => {
    it('adds the device top inset to the configured header height', () => {
        expect.hasAssertions();

        const metrics = getScreenChromeHeaderMetrics(HEADER_HEIGHT, INSETS_TOP);

        expect(metrics.headerTotalHeight).toBe(HEADER_HEIGHT + INSETS_TOP);
    });

    it('recommends a content gap equal to the header footprint', () => {
        expect.hasAssertions();

        const metrics = getScreenChromeHeaderMetrics(HEADER_HEIGHT, LARGE_INSETS_TOP);

        expect(metrics.recommendedContentTopGap).toBe(metrics.headerTotalHeight);
        expect(metrics.headerTotalHeight).toBe(HEADER_HEIGHT + LARGE_INSETS_TOP);
    });

    it('returns the bare header height when no top inset is reported', () => {
        expect.hasAssertions();

        const metrics = getScreenChromeHeaderMetrics(HEADER_HEIGHT, NO_INSETS_TOP);

        expect(metrics).toEqual({ headerTotalHeight: HEADER_HEIGHT, recommendedContentTopGap: HEADER_HEIGHT });
    });

    it('adds an explicit header top inset on top of the safe area', () => {
        expect.hasAssertions();

        const metrics = getScreenChromeHeaderMetrics(HEADER_HEIGHT, INSETS_TOP, LARGE_INSETS_TOP);

        expect(metrics.headerTotalHeight).toBe(HEADER_HEIGHT + INSETS_TOP + LARGE_INSETS_TOP);
        expect(metrics.recommendedContentTopGap).toBe(metrics.headerTotalHeight);
    });
});
