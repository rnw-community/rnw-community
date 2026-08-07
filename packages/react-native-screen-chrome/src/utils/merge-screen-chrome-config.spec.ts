import { describe, expect, it } from '@jest/globals';

import { SCREEN_CHROME_DEFAULT_CONFIG } from '../constant/screen-chrome-default-config.constant.js';
import { ColorSchemeEnum } from '../enum/color-scheme.enum.js';

import { mergeScreenChromeConfig } from './merge-screen-chrome-config.util.js';

const OVERRIDDEN_HEADER_HEIGHT = 72;

describe('mergeScreenChromeConfig', () => {
    it('uses defaults when overrides are omitted', () => {
        expect(mergeScreenChromeConfig()).toEqual(SCREEN_CHROME_DEFAULT_CONFIG);
    });

    it('replaces scalar defaults', () => {
        const config = mergeScreenChromeConfig({
            headerHeight: OVERRIDDEN_HEADER_HEIGHT,
            snapToCollapse: true,
        });

        expect(config.headerHeight).toBe(OVERRIDDEN_HEADER_HEIGHT);
        expect(config.snapToCollapse).toBe(true);
        expect(config.topFadeHeight).toBe(SCREEN_CHROME_DEFAULT_CONFIG.topFadeHeight);
    });

    it('deep merges colors without deleting sibling schemes or values', () => {
        const config = mergeScreenChromeConfig({
            colors: {
                [ColorSchemeEnum.DARK]: {
                    solid: 'black',
                },
            },
        });

        expect(config.colors[ColorSchemeEnum.DARK]).toEqual({
            ...SCREEN_CHROME_DEFAULT_CONFIG.colors[ColorSchemeEnum.DARK],
            solid: 'black',
        });
        expect(config.colors[ColorSchemeEnum.LIGHT]).toEqual(SCREEN_CHROME_DEFAULT_CONFIG.colors[ColorSchemeEnum.LIGHT]);
    });

    it('deep merges mask stops without deleting sibling positions or stops', () => {
        const config = mergeScreenChromeConfig({
            maskStops: {
                top: {
                    0.25: { color: 'rgba(0,0,0,0.25)' },
                },
            },
        });

        expect(config.maskStops.top).toEqual({
            ...SCREEN_CHROME_DEFAULT_CONFIG.maskStops.top,
            0.25: { color: 'rgba(0,0,0,0.25)' },
        });
        expect(config.maskStops.bottom).toEqual(SCREEN_CHROME_DEFAULT_CONFIG.maskStops.bottom);
    });

    it('does not mutate source defaults or overrides', () => {
        const overrides = {
            colors: {
                [ColorSchemeEnum.LIGHT]: {
                    wash: 'white',
                },
            },
            maskStops: {
                bottom: {
                    0.75: { color: 'gray' },
                },
            },
        };

        const originalDefaults = structuredClone(SCREEN_CHROME_DEFAULT_CONFIG);
        const originalOverrides = structuredClone(overrides);

        mergeScreenChromeConfig(overrides);

        expect(SCREEN_CHROME_DEFAULT_CONFIG).toEqual(originalDefaults);
        expect(overrides).toEqual(originalOverrides);
    });

    it('does not share nested mask stop objects with defaults or overrides', () => {
        const overrideStop = { color: 'gray' };
        const config = mergeScreenChromeConfig({
            maskStops: {
                bottom: {
                    0.75: overrideStop,
                },
            },
        });

        expect(config.maskStops.top[0]).not.toBe(SCREEN_CHROME_DEFAULT_CONFIG.maskStops.top[0]);
        expect(config.maskStops.bottom[0.75]).not.toBe(overrideStop);
    });
});
