import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';

export const THRESHOLDS = {
    chromeEnergyMax: 0.2,
    rampEndEnergyMin: 0.8,
    rampDropMax: 0.12,
    rampStepPerPointMax: 0.165,
    outsideEnergyMin: 0.85,
    washMax: 120,
    washInnerEdgeMax: 6,
    washOutsideMax: 3,
    symmetryMax: 0.25,
    restDiffMax: 2,
    goldenDiffMax: 0.03,
};

const BAND_HEIGHT = 128;
const CHROME_HEIGHT = 32;
const TEXT_LINE_HEIGHT = 24;
const RULER_POINTS = 6;
const PATTERN_MARGIN_POINTS = 14;
const GOLDEN_WIDTH = 200;

const isColor = (data, index, [red, green, blue]) =>
    Math.abs(data[index] - red) < 60 && Math.abs(data[index + 1] - green) < 60 && Math.abs(data[index + 2] - blue) < 60;

const readRuler = ({ width, height, data }) => {
    const column = width - 2;
    const kinds = Array.from({ length: height }, (_, row) => {
        const index = (row * width + column) * 4;

        if (isColor(data, index, [255, 0, 255])) {
            return 'chrome';
        }

        return isColor(data, index, [0, 255, 255]) ? 'ramp' : 'content';
    });
    const topChromeEnd = kinds.indexOf('ramp');
    const topBandEnd = kinds.indexOf('content', topChromeEnd);
    const bottomChromeStart = kinds.lastIndexOf('ramp') + 1;
    const bottomBandStart = kinds.lastIndexOf('content', bottomChromeStart) + 1;
    const scale = (topBandEnd - topChromeEnd) / (BAND_HEIGHT - CHROME_HEIGHT);

    if (topChromeEnd <= 0 || bottomChromeStart >= height || !(scale > 0)) {
        throw new Error('the geometry ruler is missing from the capture');
    }

    return {
        topChromeEnd,
        topBandEnd,
        bottomBandStart,
        bottomChromeStart,
        scale,
        patternWidth: width - Math.ceil(PATTERN_MARGIN_POINTS * scale),
    };
};

const rowStats = ({ width, data }, row, patternWidth) => {
    let energy = 0;
    const sums = [0, 0, 0];
    const at = (x, channel) => data[(row * width + x) * 4 + channel];

    for (let x = 0; x < patternWidth; x++) {
        for (let channel = 0; channel < 3; channel++) {
            sums[channel] += at(x, channel);

            if (x > 0 && x < patternWidth - 1) {
                energy += (at(x + 1, channel) - 2 * at(x, channel) + at(x - 1, channel)) ** 2;
            }
        }
    }

    return { energy: energy / (patternWidth - 2), mean: sums.map(sum => sum / patternWidth) };
};

const profile = (capture, reference, rows, patternWidth) => {
    const captured = rows.map(row => rowStats(capture, row, patternWidth));
    const original = rows.map(row => rowStats(reference, row, patternWidth));
    const window = Math.round(TEXT_LINE_HEIGHT * readRuler(reference).scale);
    const washes = [0, 1, 2].map(channel => {
        const capturedMeans = smooth(
            captured.map(row => row.mean[channel]),
            window
        );
        const originalMeans = smooth(
            original.map(row => row.mean[channel]),
            window
        );

        return capturedMeans.map((value, index) => Math.abs(value - originalMeans[index]));
    });

    return captured.map((row, index) => ({
        energy: row.energy / Math.max(original[index].energy, 1),
        wash: Math.max(...row.mean.map((value, channel) => Math.abs(value - original[index].mean[channel]))),
        averageWash: Math.max(...washes.map(channel => channel[index])),
    }));
};

const range = (from, to) => Array.from({ length: Math.max(0, to - from) }, (_, index) => from + index);
const mean = values => values.reduce((sum, value) => sum + value, 0) / values.length;
const smooth = (values, window) =>
    values.map((_, index) => mean(values.slice(Math.max(0, index - window), Math.min(values.length, index + window + 1))));

const checkBand = (name, chrome, ramp, scale, failures) => {
    const step = Math.max(1, Math.round(scale));
    const energy = smooth(
        ramp.map(({ energy: value }) => value),
        step
    );
    const chromeEnergy = mean(chrome.map(({ energy: value }) => value));
    const runningMax = energy.map((_, index) => Math.max(...energy.slice(0, index + 1)));
    const drop = energy.findIndex((value, index) => runningMax[index] - value > THRESHOLDS.rampDropMax);
    const jump = energy.findIndex(
        (value, index) => index >= step && value - energy[index - step] > THRESHOLDS.rampStepPerPointMax
    );
    const washes = [...chrome, ...ramp].map(({ wash }) => wash);
    const maximumWash = Math.max(...[...chrome, ...ramp].map(({ averageWash }) => averageWash));
    const at = index => `${(index / scale).toFixed(0)}pt into the ramp`;

    if (chromeEnergy > THRESHOLDS.chromeEnergyMax) {
        failures.push(`${name}: chrome zone keeps ${chromeEnergy.toFixed(2)} of the content detail, the blur is missing`);
    }
    if (mean(energy.slice(-2 * step)) < THRESHOLDS.rampEndEnergyMin) {
        failures.push(`${name}: content is still blurred at the band's inner edge`);
    }
    if (drop >= 0) {
        failures.push(`${name}: the ramp gets blurrier again ${at(drop)}`);
    }
    if (jump >= 0) {
        failures.push(`${name}: a visible blur edge ${at(jump)}`);
    }
    if (maximumWash > THRESHOLDS.washMax) {
        failures.push(`${name}: the wash is an opaque slab (${maximumWash.toFixed(0)} levels)`);
    }
    if (mean(washes.slice(-2 * step)) > THRESHOLDS.washInnerEdgeMax) {
        failures.push(`${name}: the wash does not fade out at the inner edge`);
    }

    return energy;
};

const resample = (values, length) =>
    Array.from({ length }, (_, index) => values[Math.floor((index * values.length) / length)]);

export const checkScrolledCapture = (capture, reference) => {
    if (capture.width !== reference.width || capture.height !== reference.height) {
        return ['capture size differs from the reference'];
    }

    const failures = [];
    const geometry = readRuler(reference);
    const { topChromeEnd, topBandEnd, bottomBandStart, bottomChromeStart, scale, patternWidth } = geometry;
    const topRamp = checkBand(
        'top',
        profile(capture, reference, range(0, topChromeEnd), patternWidth),
        profile(capture, reference, range(topChromeEnd, topBandEnd), patternWidth),
        scale,
        failures
    );
    const bottomRamp = checkBand(
        'bottom',
        profile(capture, reference, range(bottomChromeStart, capture.height).reverse(), patternWidth),
        profile(capture, reference, range(bottomBandStart, bottomChromeStart).reverse(), patternWidth),
        scale,
        failures
    );
    const outside = profile(
        capture,
        reference,
        range(topBandEnd + Math.round(4 * scale), bottomBandStart - Math.round(4 * scale)),
        patternWidth
    );
    const length = Math.min(topRamp.length, bottomRamp.length);
    const asymmetry = Math.max(
        ...resample(topRamp, length).map((value, index) => Math.abs(value - resample(bottomRamp, length)[index]))
    );

    if (Math.min(...outside.map(({ energy }) => energy)) < THRESHOLDS.outsideEnergyMin) {
        failures.push('content outside the bands is blurred');
    }
    if (Math.max(...outside.map(({ wash }) => wash)) > THRESHOLDS.washOutsideMax) {
        failures.push('content outside the bands is tinted');
    }
    if (asymmetry > THRESHOLDS.symmetryMax) {
        failures.push(`the top and bottom ramps differ by ${asymmetry.toFixed(2)}`);
    }

    return failures;
};

export const checkRestCapture = (capture, reference) => {
    if (capture.width !== reference.width || capture.height !== reference.height) {
        return ['capture size differs from the reference'];
    }

    const { patternWidth } = readRuler(reference);
    const worstRow = Math.max(
        ...range(0, capture.height).map(row => {
            const difference = [0, 0, 0];

            for (let x = 0; x < patternWidth; x++) {
                for (let channel = 0; channel < 3; channel++) {
                    const index = (row * capture.width + x) * 4 + channel;

                    difference[channel] += Math.abs(capture.data[index] - reference.data[index]);
                }
            }

            return Math.max(...difference) / patternWidth;
        })
    );

    return worstRow > THRESHOLDS.restDiffMax ? [`the band is visible at rest (${worstRow.toFixed(1)} levels)`] : [];
};

const downscale = image => {
    const factor = image.width / GOLDEN_WIDTH;
    const height = Math.floor(image.height / factor);
    const output = new PNG({ width: GOLDEN_WIDTH, height });

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < GOLDEN_WIDTH; x++) {
            const source = (Math.floor(y * factor) * image.width + Math.floor(x * factor)) * 4;

            image.data.copy(output.data, (y * GOLDEN_WIDTH + x) * 4, source, source + 4);
        }
    }

    return output;
};

const checkGolden = (name, capture, baselineDir, update) => {
    const small = downscale(capture);
    const baselinePath = join(baselineDir, `${name}.png`);

    if (update || !existsSync(baselinePath)) {
        mkdirSync(baselineDir, { recursive: true });
        writeFileSync(baselinePath, PNG.sync.write(small));

        return update ? [] : [`${name}: no golden baseline, wrote one; commit it after review`];
    }

    const baseline = PNG.sync.read(readFileSync(baselinePath));

    if (baseline.height !== small.height) {
        return [`${name}: the capture size differs from the golden baseline`];
    }

    const changed = pixelmatch(baseline.data, small.data, null, GOLDEN_WIDTH, small.height, { threshold: 0.1 });
    const share = changed / (GOLDEN_WIDTH * small.height);

    return share > THRESHOLDS.goldenDiffMax
        ? [`${name}: ${(share * 100).toFixed(1)}% of the pixels differ from the golden baseline`]
        : [];
};

export const checkCaptureDir = (captureDir, baselineDir, update = false) => {
    const read = name => PNG.sync.read(readFileSync(join(captureDir, `${name}.png`)));
    const cells = readdirSync(captureDir)
        .filter(file => file.endsWith('-reference.png'))
        .map(file => file.replace('-reference.png', ''));

    const expectedCells = ['dark', 'light'].flatMap(scheme =>
        ['dark', 'light', 'vivid'].map(background => `${scheme}-${background}`)
    );

    if (cells.length !== expectedCells.length || expectedCells.some(cell => !cells.includes(cell))) {
        return [`expected the complete scheme and background matrix, found: ${cells.join(', ')}`];
    }

    return cells.flatMap(cell => {
        const reference = read(`${cell}-reference`);
        const scrolled = read(`${cell}-scrolled`);
        const rest = read(`${cell}-rest`);

        return [
            ...checkScrolledCapture(scrolled, reference).map(failure => `${cell} scrolled: ${failure}`),
            ...checkRestCapture(rest, reference).map(failure => `${cell} rest: ${failure}`),
            ...checkGolden(`${cell}-scrolled`, scrolled, baselineDir, update),
        ];
    });
};

if (process.argv[1] === fileURLToPath(import.meta.url)) {
    const [captureDir, baselineDir] = process.argv.slice(2);
    const failures = checkCaptureDir(captureDir, baselineDir, process.argv.includes('--update'));

    for (const failure of failures) {
        console.error(failure);
    }

    console.log(
        failures.length === 0 ? 'edge-fade harness: all checks passed' : `edge-fade harness: ${failures.length} failures`
    );
    process.exitCode = failures.length === 0 ? 0 : 1;
}
