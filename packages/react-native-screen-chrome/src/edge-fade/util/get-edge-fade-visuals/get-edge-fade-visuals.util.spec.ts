import { describe, expect, it, jest } from '@jest/globals';
import { easeGradient } from 'react-native-easing-gradient';

import { SCREEN_CHROME_DEFAULT_CONFIG } from '../../../constant/screen-chrome-default-config.constant';

import { getEdgeFadeVisuals } from './get-edge-fade-visuals.util';

const MINIMUM_EASED_STOPS = 3;

jest.mock('react-native-easing-gradient', () => {
    const actual = jest.requireActual<typeof import('react-native-easing-gradient')>('react-native-easing-gradient');

    return { easeGradient: jest.fn(actual.easeGradient) };
});

describe('getEdgeFadeVisuals', () => {
    it('builds the light iOS top wash and eases the mask from the opaque stop to the transparent stop', () => {
        expect.hasAssertions();

        const visuals = getEdgeFadeVisuals('top', 'light', SCREEN_CHROME_DEFAULT_CONFIG, true);
        const midpointIndex = visuals.maskLocations.indexOf(0.5);

        expect(visuals.washColors).toEqual([
            SCREEN_CHROME_DEFAULT_CONFIG.colors.light.solid,
            SCREEN_CHROME_DEFAULT_CONFIG.colors.light.wash,
        ]);
        expect(visuals.tint).toBe('systemChromeMaterialLight');
        expect(visuals.maskColors.length).toBeGreaterThanOrEqual(MINIMUM_EASED_STOPS);
        expect(visuals.maskLocations).toHaveLength(visuals.maskColors.length);
        expect(midpointIndex).toBeGreaterThan(0);
        expect(visuals.maskColors.at(0)).toBe('rgba(0, 0, 0, 0.988)');
        expect(visuals.maskColors.at(midpointIndex)).toBe('rgba(0, 0, 0, 1)');
        expect(visuals.maskColors.at(-1)).toBe('rgba(0, 0, 0, 0)');
        expect(visuals.maskLocations.at(0)).toBe(0);
        expect(visuals.maskLocations.at(-1)).toBe(1);
        expect([...visuals.maskLocations].sort((first, second) => first - second)).toEqual([...visuals.maskLocations]);
    });

    it('mirrors the wash and the eased mask for the dark non-iOS bottom band', () => {
        expect.hasAssertions();

        const visuals = getEdgeFadeVisuals('bottom', 'dark', SCREEN_CHROME_DEFAULT_CONFIG, false);

        expect(visuals.washColors).toEqual([
            SCREEN_CHROME_DEFAULT_CONFIG.colors.dark.wash,
            SCREEN_CHROME_DEFAULT_CONFIG.colors.dark.solid,
        ]);
        expect(visuals.tint).toBe('systemThinMaterialDark');
        expect(visuals.maskColors.at(0)).toBe('rgba(0, 0, 0, 0)');
        expect(visuals.maskColors.at(-1)).toBe('rgba(0, 0, 0, 0.988)');
        expect(visuals.maskLocations.at(0)).toBe(0);
        expect(visuals.maskLocations.at(-1)).toBe(1);
    });

    it('rejects mask gradients whose colors have fewer than two stops', () => {
        expect.hasAssertions();

        jest.mocked(easeGradient).mockReturnValueOnce({ colors: ['#000000'], locations: [0, 1] });

        expect(() => getEdgeFadeVisuals('top', 'light', SCREEN_CHROME_DEFAULT_CONFIG, true)).toThrow(
            new TypeError('EdgeFade gradients require at least two stops')
        );
    });

    it('rejects mask gradients whose locations have fewer than two stops', () => {
        expect.hasAssertions();

        jest.mocked(easeGradient).mockReturnValueOnce({ colors: ['#000000', '#ffffff'], locations: [0] });

        expect(() => getEdgeFadeVisuals('top', 'light', SCREEN_CHROME_DEFAULT_CONFIG, true)).toThrow(
            new TypeError('EdgeFade gradients require at least two stops')
        );
    });
});
