import { describe, expect, it } from '@jest/globals';

import { getWebEdgeFadeBlurLayers } from './get-web-edge-fade-blur-layers.util';

describe('getWebEdgeFadeBlurLayers', () => {
    it('blends a full-radius blur continuously over the whole ramp', () => {
        expect.hasAssertions();

        const layers = getWebEdgeFadeBlurLayers('top', 20, 80, 0.5);

        expect(layers).toHaveLength(1);
        expect(layers[0]).toMatchObject({
            top: '0%',
            bottom: '-50%',
            backdropFilter: 'blur(20px) saturate(1.08)',
            WebkitBackdropFilter: 'blur(20px) saturate(1.08)',
        });
        expect(layers[0].maskImage).toContain('rgba(0,0,0,0.5) 50%');
        expect(layers[0].maskImage).toContain('rgba(0,0,0,0) 66.6667%');
        expect(layers[0].WebkitMaskImage).toBe(layers[0].maskImage);
    });

    it('mirrors the eased mask and sampling padding at the bottom edge', () => {
        expect.hasAssertions();

        const [layer] = getWebEdgeFadeBlurLayers('bottom', 20, 80, 0.5);

        expect(layer).toMatchObject({ bottom: '0%', top: '-50%' });
        expect(layer.maskImage).toMatch(/^linear-gradient\(to top/u);
    });
});
