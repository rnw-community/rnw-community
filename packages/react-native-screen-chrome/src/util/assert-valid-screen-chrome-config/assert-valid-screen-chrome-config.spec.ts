import { describe, expect, it } from '@jest/globals';

import { SCREEN_CHROME_DEFAULT_CONFIG } from '../../constant/screen-chrome-default-config.constant';

import { assertValidScreenChromeConfig } from './assert-valid-screen-chrome-config.util';

import type { ScreenChromeConfigInterface } from '../../interface/screen-chrome-config.interface';

const ZERO = 0;
const NEGATIVE_ONE = -1;
const INVALID_SMALL_TITLE_START = 90;
const INVALID_MASK_STOP_POSITION = 1.1;

type NumericConfigProperty = keyof Pick<
    ScreenChromeConfigInterface,
    | 'bottomFadeHeight'
    | 'headerBackdropHeight'
    | 'headerHeight'
    | 'intensity'
    | 'maxBlurIntensity'
    | 'scrollEventThrottle'
    | 'topFadeHeight'
>;

const invalidNumericCases: [NumericConfigProperty, number, string][] = [
    ['headerHeight', ZERO, 'headerHeight must be a positive finite number'],
    ['topFadeHeight', NEGATIVE_ONE, 'topFadeHeight must be a non-negative finite number'],
    ['bottomFadeHeight', Number.NaN, 'bottomFadeHeight must be a non-negative finite number'],
    ['headerBackdropHeight', Number.POSITIVE_INFINITY, 'headerBackdropHeight must be a non-negative finite number'],
    ['intensity', NEGATIVE_ONE, 'intensity must be a non-negative finite number'],
    ['maxBlurIntensity', Number.NaN, 'maxBlurIntensity must be a non-negative finite number'],
    ['scrollEventThrottle', ZERO, 'scrollEventThrottle must be a positive finite number'],
];

const buildConfig = (overrides: Partial<ScreenChromeConfigInterface> = {}): ScreenChromeConfigInterface => ({
    ...SCREEN_CHROME_DEFAULT_CONFIG,
    ...overrides,
});

describe('assertValidScreenChromeConfig', () => {
    it('accepts the default config', () => {
        expect(() => {
            assertValidScreenChromeConfig(SCREEN_CHROME_DEFAULT_CONFIG);
        }).not.toThrow();
    });

    it.each(invalidNumericCases)('rejects invalid numeric property %s', (property, value, message) => {
        expect(() => {
            assertValidScreenChromeConfig(buildConfig({ [property]: value }));
        }).toThrow(message);
    });

    it('rejects invalid threshold ordering', () => {
        expect(() => {
            assertValidScreenChromeConfig(buildConfig({ smallTitleStart: INVALID_SMALL_TITLE_START }));
        }).toThrow(
            'collapseStart must be less than or equal to smallTitleStart, smallTitleStart must be less than or equal to largeTitleEnd, and largeTitleEnd must be less than or equal to collapseEnd'
        );
    });

    it('rejects a zero-length collapse interval', () => {
        expect(() => {
            assertValidScreenChromeConfig(
                buildConfig({
                    collapseEnd: ZERO,
                    largeTitleEnd: ZERO,
                    smallTitleStart: ZERO,
                })
            );
        }).toThrow('collapseEnd must be greater than collapseStart');
    });

    it('rejects missing color strings', () => {
        expect(() => {
            assertValidScreenChromeConfig(
                buildConfig({
                    colors: {
                        ...SCREEN_CHROME_DEFAULT_CONFIG.colors,
                        light: {
                            ...SCREEN_CHROME_DEFAULT_CONFIG.colors.light,
                            solid: '',
                        },
                    },
                })
            );
        }).toThrow('colors.light.solid must be a non-empty string');
    });

    it('rejects missing color scheme records with a property-specific error', () => {
        const config = structuredClone(SCREEN_CHROME_DEFAULT_CONFIG);

        Reflect.deleteProperty(config.colors, 'light');

        expect(() => {
            assertValidScreenChromeConfig(config);
        }).toThrow('colors.light.solid must be a non-empty string');
    });

    it('rejects empty mask records', () => {
        expect(() => {
            assertValidScreenChromeConfig(
                buildConfig({
                    maskStops: {
                        ...SCREEN_CHROME_DEFAULT_CONFIG.maskStops,
                        top: {},
                    },
                })
            );
        }).toThrow('maskStops.top must contain at least one stop');
    });

    it('rejects missing mask records with a property-specific error', () => {
        const config = structuredClone(SCREEN_CHROME_DEFAULT_CONFIG);

        Reflect.deleteProperty(config.maskStops, 'top');

        expect(() => {
            assertValidScreenChromeConfig(config);
        }).toThrow('maskStops.top must contain at least one stop');
    });

    it('rejects mask stop positions outside range', () => {
        expect(() => {
            assertValidScreenChromeConfig(
                buildConfig({
                    maskStops: {
                        ...SCREEN_CHROME_DEFAULT_CONFIG.maskStops,
                        bottom: {
                            ...SCREEN_CHROME_DEFAULT_CONFIG.maskStops.bottom,
                            [INVALID_MASK_STOP_POSITION]: { color: 'black' },
                        },
                    },
                })
            );
        }).toThrow('maskStops.bottom.1.1 must be between 0 and 1');
    });

    it('rejects empty mask stop colors', () => {
        expect(() => {
            assertValidScreenChromeConfig(
                buildConfig({
                    maskStops: {
                        ...SCREEN_CHROME_DEFAULT_CONFIG.maskStops,
                        top: {
                            ...SCREEN_CHROME_DEFAULT_CONFIG.maskStops.top,
                            0.5: { color: '' },
                        },
                    },
                })
            );
        }).toThrow('maskStops.top.0.5.color must be a non-empty string');
    });
});
