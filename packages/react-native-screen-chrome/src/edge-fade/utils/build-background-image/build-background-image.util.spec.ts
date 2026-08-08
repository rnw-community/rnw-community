import { describe, expect, it } from '@jest/globals';

import { buildBackgroundImage } from './build-background-image.util.js';

const COLOR_SET = { solid: 'solid-color', wash: 'wash-color' };

describe('buildBackgroundImage', () => {
    it('builds the top fade gradient', () => {
        expect.hasAssertions();

        expect(buildBackgroundImage(COLOR_SET, 'top')).toBe(
            'linear-gradient(to bottom, solid-color 0%, wash-color 72%, transparent 100%)'
        );
    });

    it('builds the bottom fade gradient', () => {
        expect.hasAssertions();

        expect(buildBackgroundImage(COLOR_SET, 'bottom')).toBe(
            'linear-gradient(to bottom, transparent 0%, wash-color 28%, solid-color 100%)'
        );
    });
});
