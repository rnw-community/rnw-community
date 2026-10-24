import { describe, expect, it } from '@jest/globals';

import { SCREEN_CHROME_DEFAULT_CONFIG } from '../../../constant/screen-chrome-default-config.constant.web';

import { getWebEdgeFadeVisualStyle } from './get-web-edge-fade-visual-style.util';

describe('getWebEdgeFadeVisualStyle', () => {
    it('masks the wash with the ordered edge mask mirrored for WebKit and carries no backdrop filter', () => {
        expect.hasAssertions();

        const config = {
            ...SCREEN_CHROME_DEFAULT_CONFIG,
            maskStops: { ...SCREEN_CHROME_DEFAULT_CONFIG.maskStops, bottom: { 1: { color: '#000' }, 0: { color: 'red' } } },
        };

        expect(getWebEdgeFadeVisualStyle('bottom', 'dark', config)).toEqual({
            maskImage: 'linear-gradient(to bottom, red 0%, #000 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, red 0%, #000 100%)',
            backgroundImage: 'linear-gradient(to bottom, rgba(0,0,0,0.12) 0%, rgba(0,0,0,0.48) 100%)',
        });
    });
});
