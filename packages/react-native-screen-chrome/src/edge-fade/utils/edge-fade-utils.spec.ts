import { describe, expect, it } from '@jest/globals';

import { SCREEN_CHROME_DEFAULT_CONFIG } from '../../constant/screen-chrome-default-config.constant';
import { ColorSchemeEnum } from '../../enum/color-scheme.enum';

import { getEdgeFadeBackdropFilter } from './edge-fade-get-backdrop-filter.util';
import { getEdgeFadeBandMetrics } from './edge-fade-get-band-metrics.util';
import { getEdgeFadeMaskStops } from './edge-fade-get-mask-stops.util';
import { getBlurTint } from './get-blur-tint.util';

const INSETS = { top: 10, right: 20, bottom: 30, left: 40 };

describe('edge fade utilities', () => {
    it('resolves top default and bottom custom band metrics', () => {
        expect.hasAssertions();

        expect(getEdgeFadeBandMetrics('top', undefined, SCREEN_CHROME_DEFAULT_CONFIG, INSETS)).toEqual({
            height: SCREEN_CHROME_DEFAULT_CONFIG.topFadeHeight + INSETS.top,
            top: -INSETS.top,
        });
        expect(getEdgeFadeBandMetrics('bottom', 50, SCREEN_CHROME_DEFAULT_CONFIG, INSETS)).toEqual({
            height: 50 + INSETS.bottom,
            bottom: -INSETS.bottom,
        });
    });

    it('enforces the minimum web blur and scales larger intensities', () => {
        expect.hasAssertions();

        expect(getEdgeFadeBackdropFilter(0)).toBe('blur(8px) saturate(1.08)');
        expect(getEdgeFadeBackdropFilter(50)).toBe('blur(22.5px) saturate(1.08)');
    });

    it('selects platform-aware light and dark blur tints', () => {
        expect.hasAssertions();

        expect(getBlurTint(ColorSchemeEnum.DARK, true)).toBe('systemThinMaterialDark');
        expect(getBlurTint(ColorSchemeEnum.LIGHT, true)).toBe('systemChromeMaterialLight');
        expect(getBlurTint(ColorSchemeEnum.LIGHT, false)).toBe('systemMaterialLight');
    });

    it('creates ordered mask gradient output', () => {
        expect.hasAssertions();

        const gradient = getEdgeFadeMaskStops(SCREEN_CHROME_DEFAULT_CONFIG.maskStops, 'top');

        expect(gradient.colors.length).toBeGreaterThanOrEqual(2);
        expect(gradient.locations).toHaveLength(gradient.colors.length);
    });
});
