import { describe, expect, it, jest } from '@jest/globals';

import { SCREEN_CHROME_DEFAULT_CONFIG } from '../../../constant/screen-chrome-default-config.constant';
import { getEdgeFadeMaskStops } from '../edge-fade-get-mask-stops/edge-fade-get-mask-stops.util';

import { getEdgeFadeVisuals } from './get-edge-fade-visuals.util';

jest.mock('../edge-fade-get-mask-stops/edge-fade-get-mask-stops.util', () => {
    const actual = jest.requireActual<typeof import('../edge-fade-get-mask-stops/edge-fade-get-mask-stops.util')>(
        '../edge-fade-get-mask-stops/edge-fade-get-mask-stops.util'
    );

    return { getEdgeFadeMaskStops: jest.fn(actual.getEdgeFadeMaskStops) };
});

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

    it('rejects mask gradients whose colors have fewer than two stops', () => {
        expect.hasAssertions();

        jest.mocked(getEdgeFadeMaskStops).mockReturnValueOnce({ colors: ['#000000'], locations: [0, 1] });

        expect(() => getEdgeFadeVisuals('top', 'light', SCREEN_CHROME_DEFAULT_CONFIG, true)).toThrow(
            new TypeError('EdgeFade gradients require at least two stops')
        );
    });

    it('rejects mask gradients whose locations have fewer than two stops', () => {
        expect.hasAssertions();

        jest.mocked(getEdgeFadeMaskStops).mockReturnValueOnce({ colors: ['#000000', '#ffffff'], locations: [0] });

        expect(() => getEdgeFadeVisuals('top', 'light', SCREEN_CHROME_DEFAULT_CONFIG, true)).toThrow(
            new TypeError('EdgeFade gradients require at least two stops')
        );
    });
});
