import { describe, expect, it } from '@jest/globals';

import { SCREEN_CHROME_DEFAULT_CONFIG } from '../../../constant/screen-chrome-default-config.constant.web';

import { getWebEdgeFadeBlurLayers } from './get-web-edge-fade-blur-layers.util';

const TOP_EDGE_MASK = 'linear-gradient(to bottom, rgba(0,0,0,0.99) 0%, #000000 50%, transparent 100%)';

describe('getWebEdgeFadeBlurLayers', () => {
    it('halves the blur radius per slice away from the intensity-derived radius at the screen edge', () => {
        expect.hasAssertions();

        const layers = getWebEdgeFadeBlurLayers('top', SCREEN_CHROME_DEFAULT_CONFIG, 50);

        expect(layers.map(({ backdropFilter }) => backdropFilter)).toEqual([
            'blur(22.5px) saturate(1.08)',
            'blur(11.25px) saturate(1.08)',
            'blur(5.625px) saturate(1.08)',
            'blur(2.8125px) saturate(1.08)',
        ]);
        expect(layers.every(layer => layer.WebkitBackdropFilter === layer.backdropFilter)).toBe(true);
    });

    it('enforces the minimum edge radius at low intensity', () => {
        expect.hasAssertions();

        const [edgeSlice] = getWebEdgeFadeBlurLayers('bottom', SCREEN_CHROME_DEFAULT_CONFIG, 0);

        expect(edgeSlice).toHaveProperty('backdropFilter', 'blur(8px) saturate(1.08)');
    });

    it('lays the blurs out as non-overlapping quarter slices stepping inward from the edge', () => {
        expect.hasAssertions();

        expect(getWebEdgeFadeBlurLayers('top', SCREEN_CHROME_DEFAULT_CONFIG, 50)).toMatchObject([
            { top: '0%', bottom: '75%' },
            { top: '25%', bottom: '50%' },
            { top: '50%', bottom: '25%' },
            { top: '75%', bottom: '0%' },
        ]);
        expect(getWebEdgeFadeBlurLayers('bottom', SCREEN_CHROME_DEFAULT_CONFIG, 50)).toMatchObject([
            { bottom: '0%', top: '75%' },
            { bottom: '25%', top: '50%' },
            { bottom: '50%', top: '25%' },
            { bottom: '75%', top: '0%' },
        ]);
    });

    it('stretches the edge mask across the whole band and shows each slice its own quarter of it', () => {
        expect.hasAssertions();

        const layers = getWebEdgeFadeBlurLayers('top', SCREEN_CHROME_DEFAULT_CONFIG, 50);

        expect(layers[0]).toMatchObject({
            maskImage: TOP_EDGE_MASK,
            WebkitMaskImage: TOP_EDGE_MASK,
            maskSize: '100% 400%',
            WebkitMaskSize: '100% 400%',
            maskRepeat: 'no-repeat',
            WebkitMaskRepeat: 'no-repeat',
        });
        expect(layers.map(({ maskPosition }) => maskPosition)).toEqual([
            '0% 0%',
            '0% 33.33333333333333%',
            '0% 66.66666666666666%',
            '0% 100%',
        ]);
        expect(layers.every(layer => layer.WebkitMaskPosition === layer.maskPosition)).toBe(true);
    });

    it('positions the bottom slices from the bottom of the stretched mask', () => {
        expect.hasAssertions();

        const layers = getWebEdgeFadeBlurLayers('bottom', SCREEN_CHROME_DEFAULT_CONFIG, 50);

        expect(layers.map(({ maskPosition }) => maskPosition)).toEqual([
            '0% 100%',
            '0% 66.66666666666666%',
            '0% 33.33333333333333%',
            '0% 0%',
        ]);
    });
});
