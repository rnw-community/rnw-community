import { describe, expect, it } from '@jest/globals';

import { SCREEN_CHROME_DEFAULT_CONFIG } from '../../../constant/screen-chrome-default-config.constant.web';

import { getWebEdgeFadeVisualStyle } from './get-web-edge-fade-visual-style.util';

describe('getWebEdgeFadeVisualStyle', () => {
    it('orders mask stops by offset and mirrors the backdrop filter and mask for WebKit', () => {
        expect.hasAssertions();

        const config = {
            ...SCREEN_CHROME_DEFAULT_CONFIG,
            maskStops: { ...SCREEN_CHROME_DEFAULT_CONFIG.maskStops, bottom: { 1: { color: '#000' }, 0: { color: 'red' } } },
        };

        expect(getWebEdgeFadeVisualStyle('bottom', 'dark', config, 40)).toEqual({
            backdropFilter: 'blur(18px) saturate(1.08)',
            WebkitBackdropFilter: 'blur(18px) saturate(1.08)',
            maskImage: 'linear-gradient(to bottom, red 0%, #000 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, red 0%, #000 100%)',
            backgroundImage: `linear-gradient(to bottom, transparent 0%, ${config.colors.dark.wash} 28%, ${config.colors.dark.solid} 100%)`,
        });
    });
});
