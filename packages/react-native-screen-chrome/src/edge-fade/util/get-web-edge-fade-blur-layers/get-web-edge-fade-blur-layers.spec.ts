import { describe, expect, it } from '@jest/globals';

import { getWebEdgeFadeBlurLayers } from './get-web-edge-fade-blur-layers.util';

describe('getWebEdgeFadeBlurLayers', () => {
    it('halves the blur radius per layer away from the screen edge', () => {
        expect.hasAssertions();

        const layers = getWebEdgeFadeBlurLayers('top', 20, 80, 0.5);

        expect(layers.map(({ backdropFilter }) => backdropFilter)).toEqual([
            'blur(20px) saturate(1.08)',
            'blur(10px) saturate(1.08)',
            'blur(5px) saturate(1.08)',
            'blur(2.5px) saturate(1.08)',
        ]);
        expect(layers.every(layer => layer.WebkitBackdropFilter === layer.backdropFilter)).toBe(true);
    });

    it('pads every layer box two radii past its visible span so the backdrop edge never shows', () => {
        expect.hasAssertions();

        expect(getWebEdgeFadeBlurLayers('top', 20, 80, 0.5)).toMatchObject([
            { top: '0%', bottom: '-12.5%' },
            { top: '12.5%', bottom: '0%' },
            { top: '37.5%', bottom: '0%' },
            { top: '56.25%', bottom: '-6.25%' },
        ]);
        expect(getWebEdgeFadeBlurLayers('bottom', 20, 80, 0.5)[0]).toMatchObject({ bottom: '0%', top: '-12.5%' });
    });

    it('cross-fades each weaker layer in under the previous one before that one fades out', () => {
        expect.hasAssertions();

        expect(getWebEdgeFadeBlurLayers('top', 20, 80, 0.5).map(({ maskImage }) => maskImage)).toEqual([
            'linear-gradient(to bottom, #000000 0%, #000000 44.4444%, transparent 55.5556%)',
            'linear-gradient(to bottom, transparent 28.5714%, #000000 42.8571%, #000000 57.1429%, transparent 71.4286%)',
            'linear-gradient(to bottom, transparent 20%, #000000 40%, #000000 60%, transparent 80%)',
            'linear-gradient(to bottom, transparent 12.5%, #000000 37.5%, #000000 62.5%, transparent 87.5%)',
        ]);
        expect(getWebEdgeFadeBlurLayers('bottom', 20, 80, 0.5)[2]).toMatchObject({
            maskImage: 'linear-gradient(to top, transparent 20%, #000000 40%, #000000 60%, transparent 80%)',
            WebkitMaskImage: 'linear-gradient(to top, transparent 20%, #000000 40%, #000000 60%, transparent 80%)',
        });
    });
});
