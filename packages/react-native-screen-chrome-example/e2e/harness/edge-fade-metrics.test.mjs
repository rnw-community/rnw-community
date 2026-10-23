import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';

import { PNG } from 'pngjs';

import {
    checkBackgroundMetadata,
    checkBlurOnlyCapture,
    checkRestCapture,
    checkScrolledCapture,
    checkTemporalCaptureDir,
    checkTemporalFrames,
} from './edge-fade-metrics.mjs';

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
const RULER_WIDTH = 6;
const WASH = 0.42;
const SCREEN_BACKGROUND = [16, 16, 16];
const TEMPORAL_SCALE_DOWN = 6;
const TEMPORAL_WITNESS_CONTENT_OFFSET = 620;
const TEMPORAL_RECORDINGS = ['dark-dark', 'dark-light', 'dark-vivid', 'light-dark', 'light-light', 'light-vivid'];

const reference = (topInset = TOP_INSET, bottomInset = BOTTOM_INSET) => {
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

    ruler(0, topInset + CHROME, [255, 0, 255]);
    ruler(topInset + CHROME, topInset + BAND, [0, 255, 255]);
    ruler(HEIGHT - bottomInset - BAND, HEIGHT - bottomInset - CHROME, [0, 255, 255]);
    ruler(HEIGHT - bottomInset - CHROME, HEIGHT, [255, 0, 255]);

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
                const index = (y * source.width + x) * 4 + channel;

                capture.data[index] = capture.data[index] * (1 - alpha) + SCREEN_BACKGROUND[channel] * alpha;
            }
        }
    };

    for (let depth = 0; depth < TOP_INSET + BAND; depth++) {
        paint(depth, depth - TOP_INSET);
        paint(HEIGHT - 1 - depth, depth - BOTTOM_INSET);
    }

    return { capture, reference: source };
};

const opaqueWashOnly = (topInset, bottomInset) => {
    const source = reference(topInset * SCALE, bottomInset * SCALE);
    const capture = new PNG({ width: WIDTH, height: HEIGHT });
    source.data.copy(capture.data);
    const stops = [
        [0, 1],
        [0.25, 143 / 255],
        [0.5, 64 / 255],
        [0.75, 15 / 255],
        [1, 0],
    ];

    for (let row = 0; row < HEIGHT; row++) {
        const depth =
            row < (topInset + BAND / SCALE) * SCALE
                ? row / ((topInset + BAND / SCALE) * SCALE)
                : row >= HEIGHT - (bottomInset + BAND / SCALE) * SCALE
                  ? (HEIGHT - 1 - row) / ((bottomInset + BAND / SCALE) * SCALE)
                  : 1;
        const stop = Math.min(3, Math.floor(depth * 4));
        const [fromDepth, fromAlpha] = stops[stop];
        const [toDepth, toAlpha] = stops[stop + 1];
        const alpha = fromAlpha + ((toAlpha - fromAlpha) * (depth - fromDepth)) / (toDepth - fromDepth);

        for (let x = 0; x < PATTERN_WIDTH; x++) {
            for (let channel = 0; channel < 3; channel++) {
                const index = (row * WIDTH + x) * 4 + channel;

                capture.data[index] = source.data[index] * (1 - alpha) + SCREEN_BACKGROUND[channel] * alpha;
            }
        }
    }

    return { capture, reference: source };
};

const fitBackgroundEdges = image => {
    const edgeRamp = 10 * SCALE;
    const blendRow = (row, depth) => {
        const backgroundShare = 1 - Math.min(1, depth / edgeRamp);

        for (let x = 0; x < WIDTH - RULER_WIDTH * SCALE; x++) {
            for (let channel = 0; channel < 3; channel++) {
                const index = (row * WIDTH + x) * 4 + channel;

                image.data[index] = image.data[index] * (1 - backgroundShare) + SCREEN_BACKGROUND[channel] * backgroundShare;
            }
        }
    };

    for (let depth = 0; depth < edgeRamp; depth++) {
        blendRow(depth, depth);
        blendRow(HEIGHT - 1 - depth, depth);
    }

    return image;
};

const temporalFrame = (source, luminanceShift) => {
    const image = new PNG({ width: source.width, height: source.height });
    source.data.copy(image.data);
    const scale = source.width / WIDTH;
    const topEnd = Math.round((TOP_INSET + BAND) * scale);
    const bottomStart = Math.round((HEIGHT - BOTTOM_INSET - BAND) * scale);
    const patternWidth = Math.round(PATTERN_WIDTH * scale);

    for (let y = 0; y < topEnd; y++) {
        for (let x = 0; x < patternWidth; x++) {
            for (let channel = 0; channel < 3; channel++) {
                const index = (y * source.width + x) * 4 + channel;

                image.data[index] = Math.min(255, image.data[index] + luminanceShift);
            }
        }
    }

    for (let y = bottomStart; y < source.height; y++) {
        for (let x = 0; x < patternWidth; x++) {
            for (let channel = 0; channel < 3; channel++) {
                const index = (y * WIDTH + x) * 4 + channel;

                image.data[index] = Math.min(255, image.data[index] + luminanceShift);
            }
        }
    }

    return image;
};

const temporalBase = () => {
    const { capture } = band({ wash: progress => (1 - progress) ** 2 });
    const image = new PNG({
        width: capture.width / TEMPORAL_SCALE_DOWN,
        height: capture.height / TEMPORAL_SCALE_DOWN,
    });

    for (let y = 0; y < image.height; y++) {
        for (let x = 0; x < image.width; x++) {
            const source = (y * TEMPORAL_SCALE_DOWN * capture.width + x * TEMPORAL_SCALE_DOWN) * 4;

            image.data.set(capture.data.subarray(source, source + 4), (y * image.width + x) * 4);
        }
    }

    return image;
};

const temporalFlatBackground = background => {
    const source = reference();

    for (let y = 0; y < source.height; y++) {
        for (let x = 0; x < PATTERN_WIDTH; x++) {
            const index = (y * source.width + x) * 4;

            source.data[index] = background[0];
            source.data[index + 1] = background[1];
            source.data[index + 2] = background[2];
            source.data[index + 3] = 255;
        }
    }

    const image = new PNG({
        width: source.width / TEMPORAL_SCALE_DOWN,
        height: source.height / TEMPORAL_SCALE_DOWN,
    });

    for (let y = 0; y < image.height; y++) {
        for (let x = 0; x < image.width; x++) {
            const sourceIndex = (y * TEMPORAL_SCALE_DOWN * source.width + x * TEMPORAL_SCALE_DOWN) * 4;

            image.data.set(source.data.subarray(sourceIndex, sourceIndex + 4), (y * image.width + x) * 4);
        }
    }

    return image;
};

const temporalCaptureAt = (source, offset) => {
    const image = new PNG({ width: source.width, height: source.height });
    source.data.copy(image.data);
    const left = 9;
    const top = Math.round((temporalWitnessTopPoints(offset) * SCALE) / TEMPORAL_SCALE_DOWN);
    const size = Math.round((18 * SCALE) / TEMPORAL_SCALE_DOWN);

    for (let y = top; y < top + size; y++) {
        for (let x = left; x < left + size; x++) {
            image.data.set([0, 255, 0, 255], (y * image.width + x) * 4);
        }
    }

    return image;
};

const withSystemPill = source => {
    const image = new PNG({ width: source.width, height: source.height });
    source.data.copy(image.data);
    const scale = source.width / WIDTH;
    const topSafeAreaRows = Math.round(TOP_INSET * scale);
    const pillLeft = Math.round(source.width * 0.34);
    const pillRight = Math.round(source.width * 0.66);

    for (let y = Math.round(topSafeAreaRows * 0.2); y < Math.round(topSafeAreaRows * 0.8); y++) {
        for (let x = pillLeft; x < pillRight; x++) {
            image.data.set([0, 0, 0, 255], (y * image.width + x) * 4);
        }
    }

    return image;
};

const temporalWitnessTopPoints = offset => TEMPORAL_WITNESS_CONTENT_OFFSET - offset;

const temporalSequence = (source, count) =>
    Array.from({ length: count }, (_, index) => temporalCaptureAt(source, 200 + (200 * index) / Math.max(1, count - 1)));

const meanPreservingDetailFlash = source => {
    const image = new PNG({ width: source.width, height: source.height });
    source.data.copy(image.data);

    for (const [from, to] of [
        [49, 93],
        [380, 428],
    ]) {
        for (let y = from; y < to; y++) {
            for (let x = 24; x < image.width - 8; x += 2) {
                for (let channel = 0; channel < 3; channel++) {
                    const first = (y * image.width + x) * 4 + channel;
                    const second = first + 4;
                    const sum = image.data[first] + image.data[second];
                    image.data[first] = Math.min(255, sum);
                    image.data[second] = sum - image.data[first];
                }
            }
        }
    }

    return image;
};

const slowBackgroundReversal = () => {
    const image = reference();
    const reversal = index => Math.max(0, Math.min(index, 60) - Math.max(0, index - 60) * 0.2);
    const setRow = (row, distance) => {
        const value = Math.min(255, SCREEN_BACKGROUND[0] + distance);

        for (let x = 0; x < PATTERN_WIDTH; x++) {
            image.data.set([value, value, value, 255], (row * WIDTH + x) * 4);
        }
    };

    for (let row = 0; row < TOP_INSET + BAND; row++) {
        setRow(row, reversal(row));
        setRow(HEIGHT - 1 - row, reversal(row));
    }

    return image;
};

describe('edge-fade harness metrics', () => {
    it('passes an eased progressive blur that holds behind the chrome', () => {
        const { capture, reference: original } = band();

        assert.deepEqual(checkScrolledCapture(capture, original), []);
        assert.deepEqual(checkRestCapture(original, original), []);
    });

    it('rejects a physical edge whose mean does not converge to the declared screen background', () => {
        const { capture, reference: original } = band();

        assert.match(
            checkScrolledCapture(capture, original, SCREEN_BACKGROUND).join('\n'),
            /top physical edge.*background/u
        );
    });

    it('reports when the declared background metadata disagrees with the reference pixels', () => {
        assert.match(
            checkBackgroundMetadata(reference(), [255, 255, 255], SCALE).join('\n'),
            /background metadata declares 255,255,255 but the reference shows/u
        );
    });

    it('checks the physical last row of the bottom edge', () => {
        const { capture, reference: original } = band();

        for (let x = 0; x < PATTERN_WIDTH; x++) {
            capture.data.set([255, 255, 255, 255], ((HEIGHT - 1) * WIDTH + x) * 4);
        }

        assert.match(
            checkScrolledCapture(capture, original, SCREEN_BACKGROUND).join('\n'),
            /bottom physical edge.*background/u
        );
    });

    it('accepts an edge that converges to the known screen background', () => {
        const { capture, reference: original } = band();

        assert.deepEqual(checkScrolledCapture(fitBackgroundEdges(capture), original, SCREEN_BACKGROUND), []);
    });

    it('requires blur in the independent wash-free control capture', () => {
        const source = reference();
        const unblurred = reference();

        assert.match(checkBlurOnlyCapture(unblurred, source).join('\n'), /blur is missing/u);
    });

    it('rejects wash-only captures that pass the full metric at zero and 24-point insets', () => {
        for (const [topInset, bottomInset] of [
            [0, 0],
            [0, 24],
            [24, 24],
        ]) {
            const { capture, reference: original } = opaqueWashOnly(topInset, bottomInset);

            assert.deepEqual(checkScrolledCapture(capture, original, SCREEN_BACKGROUND), []);
            assert.match(checkBlurOnlyCapture(original, original).join('\n'), /blur is missing/u);
        }
    });

    it('rejects measurable texture returning on the physical last row under the edge mean limit', () => {
        const { capture, reference: original } = band();
        fitBackgroundEdges(capture);

        for (let x = 0; x < PATTERN_WIDTH; x++) {
            const value = Math.floor(x / STRIPE) % 2 === 0 ? 0 : 32;

            capture.data.set([value, value, value, 255], ((HEIGHT - 1) * WIDTH + x) * 4);
            capture.data.set([16, 16, 16, 255], ((HEIGHT - 2) * WIDTH + x) * 4);
        }

        const failures = checkScrolledCapture(capture, original, SCREEN_BACKGROUND);

        assert.ok(failures.some(failure => /bottom physical edge varies/u.test(failure)));
        assert.ok(!failures.some(failure => /bottom physical edge is/u.test(failure)));
    });

    it('rejects a slow background-distance reversal that never exceeds the adjacent-row limit', () => {
        const capture = slowBackgroundReversal();
        const original = reference();

        assert.match(checkScrolledCapture(capture, original, SCREEN_BACKGROUND).join('\n'), /background delta reverses/u);
    });

    it('requires enough frames and elapsed recording time', () => {
        const source = temporalBase();
        const still = temporalCaptureAt(source, 200);

        assert.match(checkTemporalFrames([still, still, still], undefined, 5).join('\n'), /requires at least 60 frames/u);
        assert.match(checkTemporalFrames(temporalSequence(source, 60), undefined, 0.25).join('\n'), /lasted only/u);
    });

    it('requires measured scroll-witness movement instead of accepting a still recording', () => {
        const source = temporalBase();
        const still = temporalCaptureAt(source, 200);
        const frames = Array.from({ length: 60 }, () => still);

        assert.match(checkTemporalFrames(frames, undefined, 5).join('\n'), /scroll witness moved only/u);
    });

    it('keeps the scrolling witness visible between both band ROIs on iOS and Android', () => {
        for (const [platform, viewport] of [
            ['iOS', { height: 874, topInset: 62, bottomInset: 34 }],
            ['Android', { height: 640, topInset: 24, bottomInset: 24 }],
        ]) {
            for (const offset of [200, 400]) {
                const witnessTop = temporalWitnessTopPoints(offset);

                assert.ok(witnessTop > viewport.topInset + BAND / SCALE, `${platform} witness clears the top band`);
                assert.ok(
                    witnessTop + 18 < viewport.height - viewport.bottomInset - BAND / SCALE,
                    `${platform} witness clears the bottom band`
                );
            }

            assert.equal(temporalWitnessTopPoints(200) - temporalWitnessTopPoints(400), 200);
        }
    });

    it('labels each temporal recording with the selected scheme and background state', () => {
        const lines = readFileSync(new URL('./edge_fade_temporal_harness.yaml', import.meta.url), 'utf8').split('\n');
        const backgrounds = ['dark', 'light', 'vivid'];
        const schemes = ['dark', 'light'];
        const recordings = [];
        let backgroundIndex = 0;
        let schemeIndex = 0;

        for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
            if (lines[lineIndex].trim() === '- tapOn:') {
                const testID = lines[lineIndex + 1].match(/id: '([^']+)'/u)?.[1];

                if (testID === 'edge-fade-harness-background') {
                    backgroundIndex = (backgroundIndex + 1) % backgrounds.length;
                }
                if (testID === 'edge-fade-harness-scheme') {
                    schemeIndex = (schemeIndex + 1) % schemes.length;
                }
            }

            const recording = lines[lineIndex].match(/- startRecording: temporal-([^-]+-[^\s]+)/u)?.[1];

            if (recording !== undefined) {
                const selected = `${schemes[schemeIndex]}-${backgrounds[backgroundIndex]}`;

                assert.equal(recording, selected, `recording ${recording} matches selected state ${selected}`);
                recordings.push(recording);
            }
        }

        assert.deepEqual(recordings, TEMPORAL_RECORDINGS);
    });

    it('accepts smooth luminance changes during an actual traversal', () => {
        const source = temporalBase();
        const frames = temporalSequence(source, 61).map((frame, index) => temporalFrame(frame, index / 3));

        assert.deepEqual(checkTemporalFrames(frames, undefined, 5), []);
    });

    it('ignores a system pill only in the top safe-area profile while keeping physical-edge checks', () => {
        const source = temporalFlatBackground([255, 255, 255]);
        const frames = temporalSequence(source, 61).map(withSystemPill);

        assert.deepEqual(checkTemporalFrames(frames, [255, 255, 255], 5), []);

        const brokenTopEdge = frames.map(frame => {
            const image = new PNG({ width: frame.width, height: frame.height });
            frame.data.copy(image.data);

            for (let x = 0; x < image.width - 5; x++) {
                image.data.set([80, 80, 80, 255], x * 4);
            }

            return image;
        });

        assert.match(checkTemporalFrames(brokenTopEdge, [255, 255, 255], 5).join('\n'), /top physical edge is/u);
    });

    it('rejects an isolated temporal band luminance spike', () => {
        const source = temporalBase();
        const frames = temporalSequence(source, 61);
        frames[30] = temporalFrame(frames[30], 64);

        assert.match(checkTemporalFrames(frames, undefined, 5).join('\n'), /temporal band luminance spike/u);
    });

    it('rejects a mean-preserving temporal contrast flash', () => {
        const source = temporalBase();
        const frames = temporalSequence(source, 61);
        frames[30] = meanPreservingDetailFlash(frames[30]);

        assert.match(checkTemporalFrames(frames, undefined, 5).join('\n'), /temporal band detail spike/u);
    });

    it('detects a one-frame 60 fps flash between the old 12 fps sample points', () => {
        const source = temporalBase();
        const frames = temporalSequence(source, 241);
        frames[122] = temporalFrame(frames[122], 64);

        assert.match(checkTemporalFrames(frames, undefined, 4).join('\n'), /temporal band luminance spike/u);
    });

    it('fails when native temporal artifacts are missing', () => {
        assert.match(
            checkTemporalCaptureDir('/missing/edge-fade/temporal').join('\n'),
            /temporal capture artifacts are missing/u
        );
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

        assert.match(checkScrolledCapture(capture, original).join('\n'), /wash does not fade out/u);
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
