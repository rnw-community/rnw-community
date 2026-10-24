import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { PNG } from 'pngjs';

export const PLAYGROUND_THRESHOLDS = {
    chromeVisibilityMin: 0.35,
    chromeSharpnessMax: 0.5,
    blurOnlySharpnessMax: 0.5,
    rampVisibilityDropMax: 0.12,
    rampEndVisibilityMin: 0.8,
    outsideDiffMax: 2,
};

const LOW_PASS_POINTS = 24;
const PATTERN_MARGIN_POINTS = 14;
const POINT_WIDTH = 402;
const MINIMUM_RAMP_ROWS = 2;
const CONTROLS_ROWS = [0.4, 0.55];

const luminanceRow = ({ width, data }, row, patternWidth) =>
    Array.from({ length: patternWidth }, (_, x) => {
        const index = (row * width + x) * 4;

        return data[index] * 0.2126 + data[index + 1] * 0.7152 + data[index + 2] * 0.0722;
    });

const variance = values => {
    const average = values.reduce((sum, value) => sum + value, 0) / values.length;

    return values.reduce((sum, value) => sum + (value - average) ** 2, 0) / values.length;
};

const rowSignal = (image, row, patternWidth, window) => {
    const luminance = luminanceRow(image, row, patternWidth);
    const prefix = [0];

    for (const value of luminance) {
        prefix.push(prefix.at(-1) + value);
    }

    const lowPass = luminance.map((_, x) => {
        const from = Math.max(0, x - window);
        const to = Math.min(luminance.length, x + window + 1);

        return (prefix[to] - prefix[from]) / (to - from);
    });
    const detail = luminance
        .slice(1, -1)
        .reduce((sum, value, index) => sum + (luminance[index + 2] - 2 * value + luminance[index]) ** 2, 0);

    return { structure: variance(lowPass), detail: detail / (patternWidth - 2) };
};

const readRuler = ({ width, height, data }) => {
    const column = width - 2;
    const kind = row => {
        const index = (row * width + column) * 4;
        const [red, green, blue] = [data[index], data[index + 1], data[index + 2]];

        if (red > 200 && green < 60 && blue > 200) {
            return 'chrome';
        }

        return red < 60 && green > 200 && blue > 200 ? 'ramp' : 'content';
    };
    const kinds = Array.from({ length: height }, (_, row) => kind(row));
    const topChromeEnd = kinds.indexOf('content') === 0 ? 0 : kinds.findIndex(value => value !== 'chrome');
    const topBandEnd = kinds.indexOf('content', topChromeEnd);
    const bottomChromeStart = kinds.findLastIndex(value => value !== 'chrome') + 1;
    const bottomBandStart = kinds.lastIndexOf('content', bottomChromeStart - 1) + 1;
    const scale = width / POINT_WIDTH;

    return {
        topChromeEnd,
        topBandEnd,
        bottomBandStart,
        bottomChromeStart,
        scale,
        patternWidth: width - Math.ceil(PATTERN_MARGIN_POINTS * scale),
    };
};

const range = (from, to) => Array.from({ length: Math.max(0, to - from) }, (_, index) => from + index);

const ratios = (capture, reference, rows, geometry) => {
    const window = Math.round(LOW_PASS_POINTS * geometry.scale);
    const signals = rows.map(row => ({
        capture: rowSignal(capture, row, geometry.patternWidth, window),
        reference: rowSignal(reference, row, geometry.patternWidth, window),
    }));
    const sum = (source, key) => signals.reduce((total, signal) => total + signal[source][key], 0);
    const visibility = Math.sqrt(sum('capture', 'structure') / Math.max(sum('reference', 'structure'), 1e-6));
    const detail = sum('capture', 'detail') / Math.max(sum('reference', 'detail'), 1e-6);

    return { visibility, detail, sharpness: detail / Math.max(visibility ** 2, 0.05) };
};

const rampProfile = (capture, reference, rows, geometry) => {
    const step = Math.max(MINIMUM_RAMP_ROWS, Math.round(4 * geometry.scale));
    const chunks = Array.from({ length: Math.ceil(rows.length / step) }, (_, index) =>
        rows.slice(index * step, (index + 1) * step)
    );

    return chunks.map(chunk => ratios(capture, reference, chunk, geometry));
};

const meanAbsDiff = (capture, reference, rows, patternWidth) => {
    let total = 0;

    for (const row of rows) {
        for (let x = 0; x < patternWidth; x++) {
            for (let channel = 0; channel < 3; channel++) {
                const index = (row * capture.width + x) * 4 + channel;

                total += Math.abs(capture.data[index] - reference.data[index]);
            }
        }
    }

    return total / (rows.length * patternWidth * 3);
};

export const measurePlaygroundCell = (capture, reference, blurOnly) => {
    const geometry = readRuler(capture);
    const { topChromeEnd, topBandEnd, bottomBandStart, bottomChromeStart, patternWidth, scale } = geometry;
    const bands = {
        top: { chrome: range(0, topChromeEnd), ramp: range(topChromeEnd, topBandEnd) },
        bottom: {
            chrome: range(bottomChromeStart, capture.height).reverse(),
            ramp: range(bottomBandStart, bottomChromeStart).reverse(),
        },
    };
    const margin = Math.round(4 * scale);

    return {
        ...Object.fromEntries(
            Object.entries(bands).map(([name, { chrome, ramp }]) => {
                const profile = rampProfile(capture, reference, ramp, geometry);

                return [
                    name,
                    {
                        chrome: ratios(capture, reference, chrome, geometry),
                        blurOnly: blurOnly === undefined ? undefined : ratios(blurOnly, reference, chrome, geometry),
                        blurOnlyRampVisibility:
                            blurOnly === undefined
                                ? undefined
                                : rampProfile(blurOnly, reference, ramp, geometry).map(({ detail }) =>
                                      Number(detail.toFixed(2))
                                  ),
                        rampVisibility: profile.map(({ visibility }) => Number(visibility.toFixed(2))),
                        rampPoints: Number((ramp.length / scale).toFixed(1)),
                    },
                ];
            })
        ),
        outsideDiff: meanAbsDiff(
            capture,
            reference,
            range(topBandEnd + margin, bottomBandStart - margin).filter(
                row => row < capture.height * CONTROLS_ROWS[0] || row > capture.height * CONTROLS_ROWS[1]
            ),
            patternWidth
        ),
    };
};

export const checkPlaygroundCell = (name, metrics) => {
    const failures = [];

    for (const edge of ['top', 'bottom']) {
        const { chrome, blurOnly, rampVisibility } = metrics[edge];
        const runningMaximum = rampVisibility.map((_, index) => Math.max(...rampVisibility.slice(0, index + 1)));
        const drop = rampVisibility.findIndex(
            (value, index) => runningMaximum[index] - value > PLAYGROUND_THRESHOLDS.rampVisibilityDropMax
        );

        if (chrome.visibility < PLAYGROUND_THRESHOLDS.chromeVisibilityMin) {
            failures.push(`${name} ${edge}: only ${chrome.visibility.toFixed(2)} of the content shows under the chrome`);
        }
        if (chrome.sharpness > PLAYGROUND_THRESHOLDS.chromeSharpnessMax) {
            failures.push(`${name} ${edge}: content under the chrome keeps ${chrome.sharpness.toFixed(2)} of its detail`);
        }
        if (blurOnly !== undefined && blurOnly.detail > PLAYGROUND_THRESHOLDS.blurOnlySharpnessMax) {
            failures.push(`${name} ${edge}: the blur alone keeps ${blurOnly.detail.toFixed(2)} of the detail`);
        }
        if (drop >= 0) {
            failures.push(`${name} ${edge}: the ramp dims again at step ${drop}`);
        }
        if ((rampVisibility.at(-1) ?? 1) < PLAYGROUND_THRESHOLDS.rampEndVisibilityMin) {
            failures.push(`${name} ${edge}: the band ends with only ${rampVisibility.at(-1)} of the content visible`);
        }
    }
    if (metrics.outsideDiff > PLAYGROUND_THRESHOLDS.outsideDiffMax) {
        failures.push(`${name}: content outside the bands changes by ${metrics.outsideDiff.toFixed(1)} levels`);
    }

    return failures;
};

export const checkPlaygroundDir = captureDir => {
    const read = name => PNG.sync.read(readFileSync(join(captureDir, `${name}.png`)));
    const cells = readdirSync(captureDir)
        .filter(file => /-(budgie|alpha-\d+|tall)\.png$/u.test(file))
        .map(file => file.replace('.png', ''));

    return cells.map(cell => {
        const offset = cell.split('-').slice(0, 2).join('-');
        const blurOnlyName = `${cell.replace(/-(budgie|alpha-\d+|tall)$/u, '')}-blur-only`;
        const metrics = measurePlaygroundCell(
            read(cell),
            read(`${offset}-reference`),
            existsSync(join(captureDir, `${blurOnlyName}.png`)) && cell.endsWith('-budgie') ? read(blurOnlyName) : undefined
        );

        return { cell, metrics, failures: checkPlaygroundCell(cell, metrics) };
    });
};

if (process.argv[1] === fileURLToPath(import.meta.url)) {
    const captureDir = process.argv[2];

    if (captureDir === undefined) {
        console.error('usage: playground-metrics.mjs <capture-dir>');
        process.exit(2);
    }

    const results = checkPlaygroundDir(captureDir);
    const passed = results.every(({ failures }) => failures.length === 0);

    console.log(JSON.stringify(results, null, 2));
    console.log(passed ? 'playground: all checks passed' : 'playground: failures');
    process.exitCode = passed ? 0 : 1;
}
