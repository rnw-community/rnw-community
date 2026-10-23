import { describe, expect, it } from '@jest/globals';

import { buildBackgroundImage } from './build-background-image.util';

const COLOR_SET = { solid: 'rgba(255,0,0,0.4)', wash: 'rgba(0,0,255,0.1)' };

describe('buildBackgroundImage', () => {
    it('fades the opaque solid color into the opaque wash color from the top edge', () => {
        expect.hasAssertions();

        expect(buildBackgroundImage(COLOR_SET, 'top')).toBe(
            'linear-gradient(to bottom, rgb(from rgba(255,0,0,0.4) r g b / 1) 0%, rgb(from rgba(0,0,255,0.1) r g b / 1) 100%)'
        );
    });

    it('fades the opaque wash color into the opaque solid color at the bottom edge', () => {
        expect.hasAssertions();

        expect(buildBackgroundImage(COLOR_SET, 'bottom')).toBe(
            'linear-gradient(to bottom, rgb(from rgba(0,0,255,0.1) r g b / 1) 0%, rgb(from rgba(255,0,0,0.4) r g b / 1) 100%)'
        );
    });

    it.each(['var(--screen-background)', 'currentColor', 'color(display-p3 1 0 0)', 'oklch(60% 0.1 30)'])(
        'preserves browser color syntax for %s',
        color => {
            expect.hasAssertions();

            expect(buildBackgroundImage({ solid: color, wash: color }, 'top')).toBe(
                `linear-gradient(to bottom, rgb(from ${color} r g b / 1) 0%, rgb(from ${color} r g b / 1) 100%)`
            );
        }
    );
});
