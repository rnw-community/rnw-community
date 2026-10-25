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
        expect(layers[0].maskImage).toContain('rgba(0,0,0,0.25) 50%');
        expect(layers[0].maskImage).toContain('rgba(0,0,0,0) 66.6667%');
        expect(layers[0].WebkitMaskImage).toBe(layers[0].maskImage);
    });

    it('holds the full blur over the plateau and eases it in quadratically from the inner edge', () => {
        expect.hasAssertions();

        const plateau = 0.08;
        const maskImage = String(getWebEdgeFadeBlurLayers('top', 8, 150, plateau)[0].maskImage);
        const padding = 1 + (2 * 8) / 150;
        const stops = [...maskImage.matchAll(/rgba\(0,0,0,([\d.]+)\) ([\d.]+)%/gu)].map(([, opacity, offset]) => ({
            opacity: Number(opacity),
            ramp: (1 - (Number(offset) / 100) * padding) / (1 - plateau),
        }));

        expect(maskImage).toMatch(/^linear-gradient\(to bottom, #000000 0%, rgba\(0,0,0,1\) /u);
        expect(stops[0].ramp).toBeCloseTo(1, 5);
        expect(stops).toHaveLength(25);
        stops.forEach(({ opacity, ramp }, index) => {
            expect(opacity).toBeCloseTo(ramp ** 2, 3);
            expect(index === 0 || opacity < stops[index - 1].opacity).toBe(true);
        });
    });

    it('mirrors the eased mask and sampling padding at the bottom edge', () => {
        expect.hasAssertions();

        const [layer] = getWebEdgeFadeBlurLayers('bottom', 20, 80, 0.5);

        expect(layer).toMatchObject({ bottom: '0%', top: '-50%' });
        expect(layer.maskImage).toMatch(/^linear-gradient\(to top/u);
    });
});
