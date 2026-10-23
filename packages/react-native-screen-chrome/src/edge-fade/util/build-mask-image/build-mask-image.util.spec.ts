import { describe, expect, it } from '@jest/globals';

import { buildMaskImage } from './build-mask-image.util';

describe('buildMaskImage', () => {
    it('orders the mask stops by offset into a top-to-bottom gradient', () => {
        expect.hasAssertions();

        expect(buildMaskImage(['#000', 'red', 'blue'], [1, 0, 0.5])).toBe(
            'linear-gradient(to bottom, red 0%, blue 50%, #000 100%)'
        );
    });
});
