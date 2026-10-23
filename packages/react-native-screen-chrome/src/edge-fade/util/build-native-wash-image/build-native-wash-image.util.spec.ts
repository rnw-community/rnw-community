import { afterEach, describe, expect, it, jest } from '@jest/globals';
import { Platform } from 'react-native';

import { SCREEN_CHROME_DEFAULT_CONFIG } from '../../../constant/screen-chrome-default-config.constant';
import { getEdgeFadeVisuals } from '../get-edge-fade-visuals/get-edge-fade-visuals.util';

import { buildNativeWashImage } from './build-native-wash-image.util';

const WASH_IMAGE = 'linear-gradient(to bottom, rgba(255,0,0,1) 0%, rgba(128,0,128,0.502) 50%, rgba(0,0,255,0) 100%)';
const CHROME_PLATEAU = 0.8;
const RGB_WASH_CONFIG = {
    ...SCREEN_CHROME_DEFAULT_CONFIG,
    colors: {
        ...SCREEN_CHROME_DEFAULT_CONFIG.colors,
        light: { solid: '#ff0000', wash: '#0000ff' },
    },
    maskStops: {
        ...SCREEN_CHROME_DEFAULT_CONFIG.maskStops,
        top: { 0: { color: '#000000' }, 1: { color: 'transparent' } },
        bottom: { 0: { color: 'transparent' }, 1: { color: '#000000' } },
    },
};

afterEach(() => {
    jest.restoreAllMocks();
});

describe('buildNativeWashImage', () => {
    it.each(['ios', 'android'] as const)(
        'blends the wash colors along the band and takes each stop alpha from the mask alone on %s',
        platform => {
            expect.hasAssertions();

            jest.replaceProperty(Platform, 'OS', platform);

            expect(
                buildNativeWashImage(
                    ['#ff0000', 'rgba(0,0,255,0.5)'],
                    ['#000000', 'rgba(0,0,0,0.5)', 'transparent'],
                    [0, 0.5, 1]
                )
            ).toBe(WASH_IMAGE);
        }
    );

    it('ignores the alpha of the configured wash colors so the outer edge is the opaque color', () => {
        expect.hasAssertions();

        expect(
            buildNativeWashImage(['rgba(255,255,255,0.42)', 'rgba(255,255,255,0.08)'], ['#000000', 'transparent'], [0, 1])
        ).toBe('linear-gradient(to bottom, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 100%)');
    });

    it('keeps the custom top edge color when the mask ramp moves inward', () => {
        expect.hasAssertions();

        const { washColors, maskColors, maskLocations } = getEdgeFadeVisuals(
            'top',
            'light',
            RGB_WASH_CONFIG,
            CHROME_PLATEAU
        );

        expect(buildNativeWashImage(washColors, maskColors, maskLocations)).toBe(
            'linear-gradient(to bottom, rgba(255,0,0,1) 0%, rgba(51,0,204,1) 80%, rgba(0,0,255,0) 100%)'
        );
    });

    it('keeps the custom bottom edge color when the mask ramp moves inward', () => {
        expect.hasAssertions();

        const { washColors, maskColors, maskLocations } = getEdgeFadeVisuals(
            'bottom',
            'light',
            RGB_WASH_CONFIG,
            CHROME_PLATEAU
        );

        expect(buildNativeWashImage(washColors, maskColors, maskLocations)).toBe(
            'linear-gradient(to bottom, rgba(0,0,255,0) 0%, rgba(51,0,204,1) 20%, rgba(255,0,0,1) 100%)'
        );
    });
});
