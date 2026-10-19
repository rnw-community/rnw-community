import { describe, expect, it } from '@jest/globals';

import { SCREEN_CHROME_DEFAULT_CONFIG } from '../../../constant/screen-chrome-default-config.constant.web';

import { getWebEdgeFadeBlurLayers } from './get-web-edge-fade-blur-layers.util';

const TOP_EDGE_MASK = 'linear-gradient(to bottom, rgba(0,0,0,0.99) 0%, #000000 50%, transparent 100%)';

describe('getWebEdgeFadeBlurLayers', () => {
    it('doubles the blur radius per layer up to the intensity-derived radius at the screen edge', () => {
        expect.hasAssertions();

        const layers = getWebEdgeFadeBlurLayers('top', SCREEN_CHROME_DEFAULT_CONFIG, 50);

        expect(layers.map(({ backdropFilter }) => backdropFilter)).toEqual([
            'blur(2.8125px) saturate(1.08)',
            'blur(5.625px) saturate(1.08)',
            'blur(11.25px) saturate(1.08)',
            'blur(22.5px) saturate(1.08)',
        ]);
        expect(layers.every(layer => layer.WebkitBackdropFilter === layer.backdropFilter)).toBe(true);
    });

    it('enforces the minimum edge radius at low intensity', () => {
        expect.hasAssertions();

        const [, , , outermost] = getWebEdgeFadeBlurLayers('bottom', SCREEN_CHROME_DEFAULT_CONFIG, 0);

        expect(outermost).toHaveProperty('backdropFilter', 'blur(8px) saturate(1.08)');
    });

    it('masks each layer to an overlapping band ramping toward the edge, intersected with the edge mask', () => {
        expect.hasAssertions();

        const [innermost, , , outermost] = getWebEdgeFadeBlurLayers('top', SCREEN_CHROME_DEFAULT_CONFIG, 50);

        expect(innermost).toMatchObject({
            maskImage: `linear-gradient(to top, transparent 0%, #000 20%, #000 40%, transparent 60%), ${TOP_EDGE_MASK}`,
            WebkitMaskImage: `linear-gradient(to top, transparent 0%, #000 20%, #000 40%, transparent 60%), ${TOP_EDGE_MASK}`,
            maskComposite: 'intersect',
            WebkitMaskComposite: 'source-in',
        });
        expect(outermost).toHaveProperty(
            'maskImage',
            `linear-gradient(to top, transparent 60%, #000 80%, #000 100%, transparent 120%), ${TOP_EDGE_MASK}`
        );
    });

    it('ramps the bands toward the bottom edge for a bottom fade', () => {
        expect.hasAssertions();

        const [innermost] = getWebEdgeFadeBlurLayers('bottom', SCREEN_CHROME_DEFAULT_CONFIG, 50);

        expect(innermost).toHaveProperty(
            'maskImage',
            expect.stringMatching(/^linear-gradient\(to bottom, transparent 0%, #000 20%/u)
        );
    });
});
