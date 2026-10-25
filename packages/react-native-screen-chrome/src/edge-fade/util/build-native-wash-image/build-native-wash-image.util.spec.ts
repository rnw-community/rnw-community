import { afterEach, describe, expect, it, jest } from '@jest/globals';
import { Platform } from 'react-native';

import { EDGE_FADE_FULL_BLUR_FRACTION } from '../../../constant/edge-fade-full-blur-fraction.constant';
import { SCREEN_CHROME_DEFAULT_CONFIG } from '../../../constant/screen-chrome-default-config.constant';
import { getEdgeFadeVisuals } from '../get-edge-fade-visuals/get-edge-fade-visuals.util';

import { buildNativeWashImage } from './build-native-wash-image.util';

import type { EdgeFadePosition } from '../../edge-fade-position.type';

const WASH_IMAGE = 'linear-gradient(to bottom, rgba(255,0,0,1) 0%, rgba(128,0,128,0.377) 50%, rgba(0,0,255,0) 100%)';
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
const SCHEME_RGB = { light: '255,255,255', dark: '0,0,0' } as const;
const MEDIUM_ALPHA = 0.7;
const ALPHA_TOLERANCE = 0.002;
const EASE_TOLERANCE = 0.005;
const ALPHAS = [0, 0.35, MEDIUM_ALPHA, 1];
const GEOMETRIES = [
    { name: 'compact header backdrop', height: 56, inset: 62 },
    { name: 'tab bar fade', height: 92, inset: 34 },
    { name: 'tall band', height: 128, inset: 62 },
    { name: 'budgie top band', height: 91, inset: 59 },
    { name: 'budgie bottom band', height: 106, inset: 34 },
    { name: 'chrome-free band', height: 150, inset: 0 },
];
const POSITIONS: readonly EdgeFadePosition[] = ['top', 'bottom'];
const MATRIX = (['light', 'dark'] as const).flatMap(scheme =>
    ALPHAS.flatMap(solidAlpha =>
        POSITIONS.flatMap(position =>
            GEOMETRIES.map(geometry => ({ scheme, solidAlpha, washAlpha: solidAlpha / 3, position, ...geometry }))
        )
    )
);

const parseStops = (image: string) =>
    [...image.matchAll(/rgba\((\d+),(\d+),(\d+),([\d.]+)\) ([\d.]+)%/gu)].map(([, red, green, blue, alpha, offset]) => ({
        rgb: `${red},${green},${blue}`,
        alpha: Number(alpha),
        location: Number(offset) / 100,
    }));

afterEach(() => {
    jest.restoreAllMocks();
});

describe('buildNativeWashImage', () => {
    it.each(['ios', 'android'] as const)(
        'blends the wash colors along the band and multiplies their alpha by the mask on %s',
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

    it('keeps the translucency of the configured wash colors at the screen edge', () => {
        expect.hasAssertions();

        expect(
            buildNativeWashImage(['rgba(255,255,255,0.42)', 'rgba(255,255,255,0.08)'], ['#000000', 'transparent'], [0, 1])
        ).toBe('linear-gradient(to bottom, rgba(255,255,255,0.42) 0%, rgba(255,255,255,0) 100%)');
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

    it.each(MATRIX)(
        '$scheme $position $name with solid alpha $solidAlpha eases the wash in and never paints more than the configured colors',
        ({ scheme, solidAlpha, washAlpha, position }) => {
            expect.hasAssertions();

            const config = {
                ...SCREEN_CHROME_DEFAULT_CONFIG,
                colors: {
                    ...SCREEN_CHROME_DEFAULT_CONFIG.colors,
                    [scheme]: {
                        solid: `rgba(${SCHEME_RGB[scheme]},${solidAlpha})`,
                        wash: `rgba(${SCHEME_RGB[scheme]},${washAlpha})`,
                    },
                },
            };
            const { washColors, maskColors, maskLocations } = getEdgeFadeVisuals(
                position,
                scheme,
                config,
                EDGE_FADE_FULL_BLUR_FRACTION
            );
            const stops = parseStops(buildNativeWashImage(washColors, maskColors, maskLocations));
            const fromEdge = position === 'top' ? stops : [...stops].reverse();
            const edgeDistance = (location: number) => (position === 'top' ? location : 1 - location);
            const [edgeStop, plateauStop] = fromEdge;

            expect(stops.every(({ rgb }) => rgb === SCHEME_RGB[scheme])).toBe(true);
            expect(edgeStop.alpha).toBeCloseTo(solidAlpha, 2);
            expect(fromEdge[fromEdge.length - 1].alpha).toBe(0);
            expect(edgeDistance(plateauStop.location)).toBeCloseTo(EDGE_FADE_FULL_BLUR_FRACTION);
            expect(stops.every(({ alpha }) => alpha <= solidAlpha + ALPHA_TOLERANCE)).toBe(true);
            expect(fromEdge.every(({ alpha }, index) => index === 0 || alpha <= fromEdge[index - 1].alpha)).toBe(true);
            fromEdge.forEach(({ alpha, location }) => {
                const distance = edgeDistance(location);
                const ramp = Math.min(1, (1 - distance) / (1 - EDGE_FADE_FULL_BLUR_FRACTION));
                const colorAlpha = solidAlpha + (washAlpha - solidAlpha) * distance;

                expect(Math.abs(alpha - colorAlpha * ramp ** 2)).toBeLessThanOrEqual(EASE_TOLERANCE);
            });
        }
    );
});
