import { describe, expect, it } from '@jest/globals';

import { SCREEN_CHROME_DEFAULT_CONFIG } from '../../../constant/screen-chrome-default-config.constant';

import { getEdgeFadeVisuals } from './get-edge-fade-visuals.util';

describe('getEdgeFadeVisuals', () => {
    it('builds top visuals for the light iOS scheme', () => {
        expect.hasAssertions();

        const visuals = getEdgeFadeVisuals('top', 'light', SCREEN_CHROME_DEFAULT_CONFIG, true);

        expect(visuals.washColors).toEqual([
            SCREEN_CHROME_DEFAULT_CONFIG.colors.light.solid,
            SCREEN_CHROME_DEFAULT_CONFIG.colors.light.wash,
        ]);
        expect(visuals.tint).toBe('systemChromeMaterialLight');
        expect(visuals.maskColors.length).toBeGreaterThanOrEqual(2);
        expect(visuals.maskLocations).toHaveLength(visuals.maskColors.length);
    });

    it('builds bottom visuals for the dark non-iOS scheme', () => {
        expect.hasAssertions();

        const visuals = getEdgeFadeVisuals('bottom', 'dark', SCREEN_CHROME_DEFAULT_CONFIG, false);

        expect(visuals.washColors).toEqual([
            SCREEN_CHROME_DEFAULT_CONFIG.colors.dark.wash,
            SCREEN_CHROME_DEFAULT_CONFIG.colors.dark.solid,
        ]);
        expect(visuals.tint).toBe('systemThinMaterialDark');
        expect(visuals.maskColors.length).toBeGreaterThanOrEqual(2);
        expect(visuals.maskLocations).toHaveLength(visuals.maskColors.length);
    });

    it('rejects mask gradients with fewer than two stops', () => {
        expect.hasAssertions();

        const invalidConfig = {
            ...SCREEN_CHROME_DEFAULT_CONFIG,
            maskStops: {
                ...SCREEN_CHROME_DEFAULT_CONFIG.maskStops,
                top: {},
            },
        };

        expect(() => getEdgeFadeVisuals('top', 'light', invalidConfig, true)).toThrow(
            'EdgeFade gradients require at least two stops'
        );
    });
});
