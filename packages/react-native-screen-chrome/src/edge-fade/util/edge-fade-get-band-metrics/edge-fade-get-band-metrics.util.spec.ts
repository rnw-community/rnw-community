import { describe, expect, it } from '@jest/globals';

import { SCREEN_CHROME_DEFAULT_CONFIG } from '../../../constant/screen-chrome-default-config.constant';

import { getEdgeFadeBandMetrics } from './edge-fade-get-band-metrics.util';

const INSETS = { top: 10, right: 20, bottom: 30, left: 40 };

describe('getEdgeFadeBandMetrics', () => {
    it('extends the default top band by the top inset from the screen edge', () => {
        expect.hasAssertions();

        expect(getEdgeFadeBandMetrics('top', undefined, SCREEN_CHROME_DEFAULT_CONFIG, INSETS)).toEqual({
            height: SCREEN_CHROME_DEFAULT_CONFIG.topFadeHeight + INSETS.top,
            top: 0,
        });
    });

    it('extends a custom bottom band by the bottom inset from the screen edge', () => {
        expect.hasAssertions();

        expect(getEdgeFadeBandMetrics('bottom', 50, SCREEN_CHROME_DEFAULT_CONFIG, INSETS)).toEqual({
            height: 50 + INSETS.bottom,
            bottom: 0,
        });
    });
});
