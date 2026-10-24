import { describe, expect, it } from '@jest/globals';

import { buildBackgroundImage } from './build-background-image.util';

const COLOR_SET = { solid: 'rgba(255,0,0,0.4)', wash: 'rgba(0,0,255,0.1)' };

describe('buildBackgroundImage', () => {
    it('fades the translucent solid color into the translucent wash color from the top edge', () => {
        expect.hasAssertions();

        expect(buildBackgroundImage(COLOR_SET, 'top')).toBe(
            'linear-gradient(to bottom, rgba(255,0,0,0.4) 0%, rgba(0,0,255,0.1) 100%)'
        );
    });

    it('fades the translucent wash color into the translucent solid color at the bottom edge', () => {
        expect.hasAssertions();

        expect(buildBackgroundImage(COLOR_SET, 'bottom')).toBe(
            'linear-gradient(to bottom, rgba(0,0,255,0.1) 0%, rgba(255,0,0,0.4) 100%)'
        );
    });

    it.each(['var(--screen-background)', 'currentColor', 'color(display-p3 1 0 0 / 0.35)', 'oklch(60% 0.1 30 / 0)'])(
        'passes browser color syntax %s through with its own alpha',
        color => {
            expect.hasAssertions();

            expect(buildBackgroundImage({ solid: color, wash: color }, 'top')).toBe(
                `linear-gradient(to bottom, ${color} 0%, ${color} 100%)`
            );
        }
    );
});
