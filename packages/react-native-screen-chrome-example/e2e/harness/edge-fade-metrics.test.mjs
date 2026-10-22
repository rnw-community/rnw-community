import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { PNG } from 'pngjs';

import { checkRestCapture, checkScrolledCapture } from './edge-fade-metrics.mjs';

const SCALE = 3;
const WIDTH = 402 * SCALE;
const HEIGHT = 874 * SCALE;
const TOP_INSET = 62 * SCALE;
const BOTTOM_INSET = 34 * SCALE;
const CHROME = 32 * SCALE;
const BAND = 128 * SCALE;
const RADIUS = 20 * SCALE;
const PATTERN_WIDTH = WIDTH - 12 * SCALE;
const STRIPE = 3 * SCALE;
const WASH = 0.42;

const reference = () => {
    const image = new PNG({ width: WIDTH, height: HEIGHT });

    for (let y = 0; y < HEIGHT; y++) {
        for (let x = 0; x < WIDTH; x++) {
            const index = (y * WIDTH + x) * 4;
            const isStripe = x < PATTERN_WIDTH && Math.floor(x / STRIPE) % 2 === 0;
            const level = isStripe ? 224 : 16;

            image.data.set([level, level, level, 255], index);
        }
    }

    const ruler = (from, to, color) => {
        for (let y = from; y < to; y++) {
            for (let x = WIDTH - 6 * SCALE; x < WIDTH; x++) {
                image.data.set([...color, 255], (y * WIDTH + x) * 4);
            }
        }
    };

    ruler(0, TOP_INSET + CHROME, [255, 0, 255]);
    ruler(TOP_INSET + CHROME, TOP_INSET + BAND, [0, 255, 255]);
    ruler(HEIGHT - BOTTOM_INSET - BAND, HEIGHT - BOTTOM_INSET - CHROME, [0, 255, 255]);
    ruler(HEIGHT - BOTTOM_INSET - CHROME, HEIGHT, [255, 0, 255]);

    return image;
};

const blurRow = (source, target, y, radius) => {
    const whole = Math.floor(radius);
    const fraction = radius - whole;

    for (let channel = 0; channel < 3; channel++) {
        const prefix = new Float64Array(PATTERN_WIDTH + 1);

        for (let x = 0; x < PATTERN_WIDTH; x++) {
            prefix[x + 1] = prefix[x] + source.data[(y * WIDTH + x) * 4 + channel];
        }

        const average = (x, reach) => {
            const from = Math.max(0, x - reach);
            const to = Math.min(PATTERN_WIDTH, x + reach + 1);

            return (prefix[to] - prefix[from]) / (to - from);
        };

        for (let x = 0; x < PATTERN_WIDTH; x++) {
            const inner = average(x, whole);

            target.data[(y * WIDTH + x) * 4 + channel] = inner + (average(x, whole + 1) - inner) * fraction;
        }
    }
};

const goodRadius = progress => RADIUS * (1 - progress) ** 3;
const goodWash = progress => WASH * (1 - progress) ** 2;

const band = ({ radius = goodRadius, chromeRadius = RADIUS, wash = goodWash, plateau = 0 } = {}) => {
    const source = reference();
    const capture = reference();
    const paint = (y, depth) => {
        const progress = Math.max(0, (depth - CHROME) / (BAND - CHROME) - plateau) / (1 - plateau);
        const alpha = wash(Math.min(1, Math.max(0, depth) / BAND));

        blurRow(source, capture, y, depth < CHROME ? chromeRadius : radius(Math.min(1, progress)));

        for (let x = 0; x < PATTERN_WIDTH; x++) {
            for (let channel = 0; channel < 3; channel++) {
                const index = (y * WIDTH + x) * 4 + channel;

                capture.data[index] = capture.data[index] * (1 - alpha) + 255 * alpha;
            }
        }
    };

    for (let depth = 0; depth < TOP_INSET + BAND; depth++) {
        paint(depth, depth - TOP_INSET);
        paint(HEIGHT - 1 - depth, depth - BOTTOM_INSET);
    }

    return { capture, reference: source };
};

describe('edge-fade harness metrics', () => {
    it('passes an eased progressive blur that holds behind the chrome', () => {
        const { capture, reference: original } = band();

        assert.deepEqual(checkScrolledCapture(capture, original), []);
        assert.deepEqual(checkRestCapture(original, original), []);
    });

    it('rejects rest and scrolled captures with different dimensions', () => {
        const original = reference();
        const capture = new PNG({ width: WIDTH + 1, height: HEIGHT + 1 });

        for (const check of [checkRestCapture, checkScrolledCapture]) {
            assert.match(check(capture, original).join('\n'), /size differs/u);
        }
    });

    it('fails a blur that never renders, as inside a MaskedView on iOS', () => {
        const { capture, reference: original } = band({ radius: () => 0, chromeRadius: 0 });

        assert.match(checkScrolledCapture(capture, original).join('\n'), /blur is missing/u);
    });

    it('fails the four stepped blur slices', () => {
        const slices = progress => (RADIUS / 2 ** Math.min(3, Math.floor(progress * 4))) * (progress < 1 ? 1 : 0);
        const { capture, reference: original } = band({ radius: slices });

        assert.match(checkScrolledCapture(capture, original).join('\n'), /visible blur edge|still blurred/u);
    });

    it('fails a half-band plateau that compresses the ramp to the slope measured on iOS', () => {
        const { capture, reference: original } = band({ plateau: 0.7 });

        assert.match(checkScrolledCapture(capture, original).join('\n'), /visible blur edge/u);
    });

    it('fails an opaque tint slab', () => {
        const { capture, reference: original } = band({ wash: () => 1 });

        assert.match(checkScrolledCapture(capture, original).join('\n'), /opaque slab/u);
    });

    it('fails a wash that ends in a hard edge', () => {
        const { capture, reference: original } = band({ wash: progress => (progress < 1 ? WASH / 2 : 0) });

        assert.match(checkScrolledCapture(capture, original).join('\n'), /does not fade out/u);
    });

    it('fails a blur visible at rest even when the row mean stays unchanged', () => {
        const { capture, reference: original } = band({ wash: () => 0 });

        assert.match(checkRestCapture(capture, original).join('\n'), /visible at rest/u);
    });

    it('fails a band that is visible at rest', () => {
        const { capture, reference: original } = band();

        assert.match(checkRestCapture(capture, original).join('\n'), /visible at rest/u);
    });
});
