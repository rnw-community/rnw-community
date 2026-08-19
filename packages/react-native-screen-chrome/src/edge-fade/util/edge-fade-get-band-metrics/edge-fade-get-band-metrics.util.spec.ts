import { describe, expect, it } from '@jest/globals';

import { SCREEN_CHROME_DEFAULT_CONFIG } from '../../../constant/screen-chrome-default-config.constant';

import { getEdgeFadeBandMetrics } from './edge-fade-get-band-metrics.util';

const INSETS = { top: 10, right: 20, bottom: 30, left: 40 };

describe('getEdgeFadeBandMetrics', () => {
    it('resolves the default top band offset by the top inset', () => {
        expect.hasAssertions();

        expect(getEdgeFadeBandMetrics('top', undefined, SCREEN_CHROME_DEFAULT_CONFIG, INSETS)).toEqual({
            height: SCREEN_CHROME_DEFAULT_CONFIG.topFadeHeight + INSETS.top,
            top: -INSETS.top,
        });
    });

    it('resolves a custom bottom band offset by the bottom inset', () => {
        expect.hasAssertions();

        expect(getEdgeFadeBandMetrics('bottom', 50, SCREEN_CHROME_DEFAULT_CONFIG, INSETS)).toEqual({
            height: 50 + INSETS.bottom,
            bottom: -INSETS.bottom,
        });
    });
});
