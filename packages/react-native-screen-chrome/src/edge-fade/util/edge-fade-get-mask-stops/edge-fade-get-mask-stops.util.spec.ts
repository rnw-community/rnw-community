import { describe, expect, it } from '@jest/globals';

import { SCREEN_CHROME_DEFAULT_CONFIG } from '../../../constant/screen-chrome-default-config.constant';

import { getEdgeFadeMaskStops } from './edge-fade-get-mask-stops.util';

describe('getEdgeFadeMaskStops', () => {
    it('creates ordered mask gradient output', () => {
        expect.hasAssertions();

        const gradient = getEdgeFadeMaskStops(SCREEN_CHROME_DEFAULT_CONFIG.maskStops, 'top');

        expect(gradient.colors.length).toBeGreaterThanOrEqual(2);
        expect(gradient.locations).toHaveLength(gradient.colors.length);
    });
});
