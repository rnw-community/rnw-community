import { describe, expect, it } from '@jest/globals';

import { SCREEN_CHROME_DEFAULT_CONFIG } from '../../constant/screen-chrome-default-config.constant';

import { mergeScreenChromeConfig } from './merge-screen-chrome-config.util';

const OVERRIDDEN_HEADER_HEIGHT = 72;

describe('mergeScreenChromeConfig', () => {
    it('uses defaults when overrides are omitted', () => {
        expect.hasAssertions();

        expect(mergeScreenChromeConfig()).toEqual(SCREEN_CHROME_DEFAULT_CONFIG);
    });

    it('replaces scalar defaults', () => {
        expect.hasAssertions();

        const config = mergeScreenChromeConfig({
            headerHeight: OVERRIDDEN_HEADER_HEIGHT,
            snapToCollapse: true,
        });

        expect(config.headerHeight).toBe(OVERRIDDEN_HEADER_HEIGHT);
        expect(config.snapToCollapse).toBe(true);
        expect(config.topFadeHeight).toBe(SCREEN_CHROME_DEFAULT_CONFIG.topFadeHeight);
    });

    it('deep merges colors without deleting sibling schemes or values', () => {
        expect.hasAssertions();

        const config = mergeScreenChromeConfig({
            colors: {
                dark: {
                    solid: 'black',
                },
            },
        });

        expect(config.colors.dark).toEqual({
            ...SCREEN_CHROME_DEFAULT_CONFIG.colors.dark,
            solid: 'black',
        });
        expect(config.colors.light).toEqual(SCREEN_CHROME_DEFAULT_CONFIG.colors.light);
    });

    it('deep merges mask stops without deleting sibling positions or stops', () => {
        expect.hasAssertions();

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
        expect.hasAssertions();

        const overrides = {
            colors: {
                light: {
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
        expect.hasAssertions();

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
