import { describe, expect, it } from '@jest/globals';

import { buildMaskImage } from './build-mask-image.util';

describe('buildMaskImage', () => {
    it('orders the mask stops by offset into a top-to-bottom gradient', () => {
        expect.hasAssertions();

        expect(buildMaskImage({ 1: { color: '#000' }, 0: { color: 'red' }, 0.5: { color: 'blue' } })).toBe(
            'linear-gradient(to bottom, red 0%, blue 50%, #000 100%)'
        );
    });
});
