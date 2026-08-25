import { describe, expect, it } from '@jest/globals';

import { SCREEN_CHROME_DEFAULT_CONFIG } from '../../../constant/screen-chrome-default-config.constant';

import { getEdgeFadeVisuals } from './get-edge-fade-visuals.util';

describe('getEdgeFadeVisuals', () => {
    it('orders the wash from solid to wash at the top edge', () => {
        expect.hasAssertions();

        const { washColors } = getEdgeFadeVisuals('top', 'light', SCREEN_CHROME_DEFAULT_CONFIG, true);

        expect(washColors).toEqual([
            SCREEN_CHROME_DEFAULT_CONFIG.colors.light.solid,
            SCREEN_CHROME_DEFAULT_CONFIG.colors.light.wash,
        ]);
    });

    it('mirrors the wash order at the bottom edge', () => {
        expect.hasAssertions();

        const { washColors } = getEdgeFadeVisuals('bottom', 'light', SCREEN_CHROME_DEFAULT_CONFIG, true);

        expect(washColors).toEqual([
            SCREEN_CHROME_DEFAULT_CONFIG.colors.light.wash,
            SCREEN_CHROME_DEFAULT_CONFIG.colors.light.solid,
        ]);
    });

    it('selects the platform tint per color scheme', () => {
        expect.hasAssertions();

        const iosLight = getEdgeFadeVisuals('top', 'light', SCREEN_CHROME_DEFAULT_CONFIG, true);
        const iosDark = getEdgeFadeVisuals('top', 'dark', SCREEN_CHROME_DEFAULT_CONFIG, true);

        expect(iosLight.tint).not.toBe(iosDark.tint);
    });
});
