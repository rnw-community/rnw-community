import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';

export const THRESHOLDS = {
    chromeVisibilityMin: 0.35,
    chromeSharpnessMax: 0.5,
    edgeVisibilityMax: 1.1,
    rampEndEnergyMin: 0.8,
    rampDropMax: 0.12,
    rampStepPerPointMax: 0.165,
    rampContrastTransitionMin: 0.35,
    outsideEnergyMin: 0.85,
    washInnerEdgeMax: 6,
    washOutsideMax: 3,
    backgroundEdgeDeviationMax: 8,
    backgroundMetadataMeanMax: 3,
    backgroundMonotonicDropMax: 4,
    symmetryMax: 0.25,
    restDiffMax: 2,
    goldenDiffMax: 0.03,
    temporalSpikeMax: 12,
    temporalDetailRatioMax: 1.75,
    temporalDetailDeltaMin: 12,
    temporalMinimumFrames: 60,
    temporalMinimumDurationSeconds: 4,
    temporalMinimumWitnessPoints: 100,
    temporalBackdropRangePoints: 80,
    temporalBackdropDriftMax: 0.15,
    temporalRampStepMax: 0.15,
};

const BAND_HEIGHT = 128;
const CHROME_HEIGHT = 32;
const DEFAULT_RAMP_POINTS = BAND_HEIGHT - CHROME_HEIGHT;
const TEMPORAL_SCROLL_END_POINTS = 200;
const TEXT_LINE_HEIGHT = 24;
const RULER_POINTS = 6;
const PATTERN_MARGIN_POINTS = 14;
const BACKGROUND_SAMPLE_INSET_POINTS = 12;
const SAFE_AREA_SIDE_SAMPLE_FRACTION = 0.3;
const POINT_WIDTH = 402;
const MINIMUM_VISIBILITY_SQUARED = 0.05;
const TEMPORAL_WITNESS_X_START_POINTS = 12;
const TEMPORAL_WITNESS_X_END_POINTS = 42;
const TEMPORAL_WITNESS_GREEN_MIN = 180;
const GOLDEN_WIDTH = 200;
const COMPACT_PREFIX = 'compact-';
const COMPACT_RAMP_POINTS = 24;
const COMPACT_CELLS = ['dark-dark'];
const COMPACT_WASH_BLUR_MISMATCH_MAX = 0.35;
const SCREEN_BACKGROUNDS = {
    dark: [16, 16, 16],
    light: [255, 255, 255],
    vivid: [10, 132, 255],
};
const TEMPORAL_CELLS = ['dark', 'light'].flatMap(scheme =>
    ['dark', 'light', 'vivid'].map(background => `${scheme}-${background}`)
);

const isColor = (data, index, [red, green, blue]) =>
    Math.abs(data[index] - red) < 60 && Math.abs(data[index + 1] - green) < 60 && Math.abs(data[index + 2] - blue) < 60;

const readRuler = ({ width, height, data }, rampPoints = DEFAULT_RAMP_POINTS) => {
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
    const scale = (topBandEnd - topChromeEnd) / rampPoints;

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

const referenceBackground = reference => {
    const scale = reference.width / POINT_WIDTH;
    const from = Math.round((POINT_WIDTH - BACKGROUND_SAMPLE_INSET_POINTS) * scale);
    const to = Math.round((POINT_WIDTH - RULER_POINTS) * scale);

    return rowColorStats(reference, Math.floor(reference.height / 2), from, to).color;
};

const profile = (capture, reference, rows, { patternWidth, scale, washWindowPoints = TEXT_LINE_HEIGHT }) => {
    const background = referenceBackground(reference);
    const captured = rows.map(row => rowStats(capture, row, patternWidth));
    const original = rows.map(row => rowStats(reference, row, patternWidth));
    const window = Math.round(washWindowPoints * scale);
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
        visibility: colorDistance(row.mean, background) / Math.max(colorDistance(original[index].mean, background), 1),
    }));
};

const colorDistance = (color, background) =>
    Math.sqrt(color.reduce((sum, value, channel) => sum + (value - background[channel]) ** 2, 0) / 3);

const rowColorStats = ({ width, data }, row, from, to, step = 1) => {
    const sums = [0, 0, 0];
    const squares = [0, 0, 0];

    for (let x = from; x < to; x += step) {
        for (let channel = 0; channel < 3; channel++) {
            const value = data[(row * width + x) * 4 + channel];

            sums[channel] += value;
            squares[channel] += value ** 2;
        }
    }

    const count = Math.ceil((to - from) / step);
    const color = sums.map(sum => sum / count);
    const deviation = Math.sqrt(mean(squares.map((sum, channel) => sum / count - color[channel] ** 2)));

    return { color, deviation };
};

const rowSideColor = ({ width, data }, row, patternWidth, step) => {
    const sideWidth = Math.floor(patternWidth * SAFE_AREA_SIDE_SAMPLE_FRACTION);
    const sums = [0, 0, 0];
    let count = 0;

    for (let x = 0; x < patternWidth; x += step) {
        if (x >= sideWidth && x < patternWidth - sideWidth) {
            continue;
        }

        for (let channel = 0; channel < 3; channel++) {
            sums[channel] += data[(row * width + x) * 4 + channel];
        }
        count++;
    }

    return sums.map(sum => sum / count);
};

export const checkBackgroundMetadata = (reference, background, scale) => {
    const from = Math.round((reference.width / scale - BACKGROUND_SAMPLE_INSET_POINTS) * scale);
    const to = Math.round((reference.width / scale - RULER_POINTS) * scale);
    const sample = rowColorStats(reference, Math.floor(reference.height / 2), from, to);
    const distance = colorDistance(sample.color, background);

    return distance > THRESHOLDS.backgroundMetadataMeanMax
        ? [
              `background metadata declares ${background.join(',')} but the reference shows ${sample.color.map(Math.round).join(',')}`,
          ]
        : [];
};

const checkScreenBackground = (capture, background, geometry, name, sampleStep = 1, topSafeAreaRows = 0) => {
    const { topBandEnd, bottomBandStart, bottomChromeStart, scale, patternWidth, reference } = geometry;
    const bottomSafeAreaRows = Math.max(0, Math.round(capture.height - bottomChromeStart - CHROME_HEIGHT * scale));
    const bottomSafeAreaStart = capture.height - bottomSafeAreaRows;
    const textLineWindow = Math.max(1, Math.round((TEXT_LINE_HEIGHT * scale) / sampleStep));
    const edgeRows = [
        { name: 'top', rows: [...range(0, topBandEnd, sampleStep), topBandEnd - 1] },
        { name: 'bottom', rows: [...range(bottomBandStart, capture.height, sampleStep), capture.height - 1].reverse() },
    ];
    const failures = [];

    for (const edge of edgeRows) {
        const firstRow = edge.rows[0];
        const outer = rowColorStats(capture, firstRow, 0, patternWidth, sampleStep);
        const distances = smooth(
            edge.rows.map(row => {
                const isSafeAreaRow = edge.name === 'top' ? row < topSafeAreaRows : row >= bottomSafeAreaStart;
                const colorOf = image =>
                    isSafeAreaRow
                        ? rowSideColor(image, row, patternWidth, sampleStep)
                        : rowColorStats(image, row, 0, patternWidth, sampleStep).color;
                const distance = colorDistance(colorOf(capture), background);

                return reference ? distance - colorDistance(colorOf(reference), background) : distance;
            }),
            textLineWindow
        );
        let runningMaximum = distances[0];
        let reversal = -1;

        for (let index = 1; index < distances.length; index++) {
            runningMaximum = Math.max(runningMaximum, distances[index]);

            if (runningMaximum - distances[index] > THRESHOLDS.backgroundMonotonicDropMax) {
                reversal = index;
                break;
            }
        }

        if (outer.deviation > THRESHOLDS.backgroundEdgeDeviationMax) {
            failures.push(
                `${name}: ${edge.name} physical edge varies by ${outer.deviation.toFixed(1)} levels against the actual background`
            );
        }
        if (reversal >= 0) {
            failures.push(
                `${name}: ${edge.name} background delta reverses ${reversal} pixels inward from the physical edge`
            );
        }
    }

    return failures;
};

const range = (from, to, step = 1) =>
    Array.from({ length: Math.ceil(Math.max(0, to - from) / step) }, (_, index) => from + index * step);
const mean = values => values.reduce((sum, value) => sum + value, 0) / values.length;
const smooth = (values, window) =>
    values.map((_, index) => mean(values.slice(Math.max(0, index - window), Math.min(values.length, index + window + 1))));

const checkBand = (name, chrome, ramp, scale, failures) => {
    const step = Math.max(1, Math.round(scale));
    const energy = smooth(
        ramp.map(({ energy: value }) => value),
        step
    );
    const contrast = energy.map(Math.sqrt);
    const transitionStart = contrast.findIndex(value => value >= 0.2);
    const transitionEnd = contrast.findIndex(value => value >= 0.8);
    const chromeEnergy = mean(chrome.map(({ energy: value }) => value));
    const chromeVisibility = mean(chrome.map(({ visibility }) => visibility));
    const chromeSharpness = chromeEnergy / Math.max(chromeVisibility ** 2, MINIMUM_VISIBILITY_SQUARED);
    const runningMax = energy.map((_, index) => Math.max(...energy.slice(0, index + 1)));
    const drop = energy.findIndex((value, index) => runningMax[index] - value > THRESHOLDS.rampDropMax);
    const jump = energy.findIndex(
        (value, index) => index >= step && value - energy[index - step] > THRESHOLDS.rampStepPerPointMax
    );
    const washes = [...chrome, ...ramp].map(({ wash }) => wash);
    const at = index => `${(index / scale).toFixed(0)}pt into the ramp`;

    if (chromeVisibility < THRESHOLDS.chromeVisibilityMin) {
        failures.push(`${name}: chrome zone shows only ${chromeVisibility.toFixed(2)} of the content, the wash hides it`);
    }
    if (chrome[0].visibility > THRESHOLDS.edgeVisibilityMax) {
        failures.push(`${name}: the physical edge row stands out ${chrome[0].visibility.toFixed(2)}x against the content`);
    }
    if (chromeSharpness > THRESHOLDS.chromeSharpnessMax) {
        failures.push(`${name}: chrome zone keeps ${chromeSharpness.toFixed(2)} of the content detail, the blur is missing`);
    }
    if (mean(energy.slice(-2 * step)) < THRESHOLDS.rampEndEnergyMin) {
        failures.push(`${name}: content is still blurred at the band's inner edge`);
    }
    if (drop >= 0) {
        failures.push(`${name}: the ramp gets blurrier again ${at(drop)}`);
    }
    if (transitionEnd >= 0 && transitionEnd - transitionStart < ramp.length * THRESHOLDS.rampContrastTransitionMin) {
        failures.push(
            `${name}: a compressed blur transition spans only ${((transitionEnd - transitionStart) / scale).toFixed(1)}pt of the ${(ramp.length / scale).toFixed(1)}pt ramp`
        );
    }
    if (jump >= 0) {
        failures.push(`${name}: a visible blur edge ${at(jump)}`);
    }
    if (mean(washes.slice(-2 * step)) > THRESHOLDS.washInnerEdgeMax) {
        failures.push(`${name}: the wash does not fade out at the inner edge`);
    }

    return energy;
};

const resample = (values, length) =>
    Array.from({ length }, (_, index) => values[Math.floor((index * values.length) / length)]);

export const checkScrolledCapture = (capture, reference, background, rampPoints) => {
    if (capture.width !== reference.width || capture.height !== reference.height) {
        return ['capture size differs from the reference'];
    }

    const failures = [];
    const geometry = readRuler(reference, rampPoints);
    const { topChromeEnd, topBandEnd, bottomBandStart, bottomChromeStart, scale } = geometry;
    if (background) {
        failures.push(...checkScreenBackground(capture, background, { ...geometry, reference }, 'scrolled capture'));
    }
    const topRamp = checkBand(
        'top',
        profile(capture, reference, range(0, topChromeEnd), geometry),
        profile(capture, reference, range(topChromeEnd, topBandEnd), geometry),
        scale,
        failures
    );
    const bottomRamp = checkBand(
        'bottom',
        profile(capture, reference, range(bottomChromeStart, capture.height).reverse(), geometry),
        profile(capture, reference, range(bottomBandStart, bottomChromeStart).reverse(), geometry),
        scale,
        failures
    );
    const outside = profile(
        capture,
        reference,
        range(topBandEnd + Math.round(4 * scale), bottomBandStart - Math.round(4 * scale)),
        geometry
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

export const checkBlurOnlyCapture = (capture, reference, rampPoints) =>
    checkScrolledCapture(capture, reference, undefined, rampPoints);

export const checkRestCapture = (capture, reference, rampPoints) => {
    if (capture.width !== reference.width || capture.height !== reference.height) {
        return ['capture size differs from the reference'];
    }

    const { patternWidth } = readRuler(reference, rampPoints);
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

const median = values => {
    const sorted = [...values].sort((left, right) => left - right);

    return sorted[Math.floor(sorted.length / 2)];
};

const temporalSignal = (frame, rows, geometry) => {
    const { patternWidth, scale } = geometry;
    const firstColumn = Math.round(TEMPORAL_WITNESS_X_END_POINTS * scale);
    const step = Math.max(1, Math.round(scale));
    let luminance = 0;
    let detail = 0;
    let samples = 0;

    for (const row of rows) {
        for (let x = firstColumn; x < patternWidth - step; x += step) {
            const left = (row * frame.width + x) * 4;
            const right = left + step * 4;
            const leftLuminance = frame.data[left] * 0.2126 + frame.data[left + 1] * 0.7152 + frame.data[left + 2] * 0.0722;
            const rightLuminance =
                frame.data[right] * 0.2126 + frame.data[right + 1] * 0.7152 + frame.data[right + 2] * 0.0722;

            luminance += leftLuminance;
            detail += Math.abs(rightLuminance - leftLuminance);
            samples++;
        }
    }

    return { luminance: luminance / samples, detail: detail / samples };
};

const witnessPosition = (frame, geometry) => {
    const { bottomBandStart, patternWidth, scale, topBandEnd } = geometry;
    const firstColumn = Math.round(TEMPORAL_WITNESS_X_START_POINTS * scale);
    const lastColumn = Math.min(patternWidth, Math.round(TEMPORAL_WITNESS_X_END_POINTS * scale));
    const firstRow = topBandEnd + Math.round(10 * scale);
    const lastRow = bottomBandStart - Math.round(10 * scale);
    let weightedRows = 0;
    let pixels = 0;

    for (let row = firstRow; row < lastRow; row++) {
        for (let x = firstColumn; x < lastColumn; x++) {
            const index = (row * frame.width + x) * 4;

            if (
                frame.data[index] < 80 &&
                frame.data[index + 1] >= TEMPORAL_WITNESS_GREEN_MIN &&
                frame.data[index + 2] < 100
            ) {
                weightedRows += row;
                pixels++;
            }
        }
    }

    return pixels < 4 ? undefined : weightedRows / pixels;
};

const summarizeTemporalFrame = (frame, geometry, background, frameIndex) => {
    const { topBandEnd, bottomBandStart } = geometry;
    const sampleStep = Math.max(1, Math.round(geometry.scale));
    const topSafeAreaRows = Math.max(0, Math.round(geometry.topChromeEnd - CHROME_HEIGHT * geometry.scale));
    const edgeRows = [range(0, topBandEnd, sampleStep), range(bottomBandStart, frame.height, sampleStep)];

    return {
        width: frame.width,
        height: frame.height,
        signals: edgeRows.map(rows => temporalSignal(frame, rows, geometry)),
        witness: witnessPosition(frame, geometry),
        backgroundFailures: background
            ? checkScreenBackground(frame, background, geometry, `temporal frame ${frameIndex}`, sampleStep, topSafeAreaRows)
            : [],
    };
};

const checkTemporalSummaries = (summaries, durationSeconds, scale) => {
    if (summaries.length < THRESHOLDS.temporalMinimumFrames) {
        return [`temporal capture requires at least ${THRESHOLDS.temporalMinimumFrames} frames`];
    }
    if (!(durationSeconds >= THRESHOLDS.temporalMinimumDurationSeconds)) {
        return [`temporal recording lasted only ${Number(durationSeconds || 0).toFixed(2)} seconds`];
    }
    if (summaries.some(summary => summary.width !== summaries[0].width || summary.height !== summaries[0].height)) {
        return ['temporal frame size differs from the first frame'];
    }

    const firstWitness = summaries[0].witness;
    const lastWitness = summaries.at(-1).witness;
    const offsets = summaries.map(({ witness }) =>
        witness === undefined || lastWitness === undefined
            ? undefined
            : TEMPORAL_SCROLL_END_POINTS - (witness - lastWitness) / scale
    );
    const failures = summaries.flatMap(summary => summary.backgroundFailures);

    if (firstWitness === undefined || lastWitness === undefined) {
        failures.push('temporal capture is missing the visible scroll witness');
    } else if ((firstWitness - lastWitness) / scale < THRESHOLDS.temporalMinimumWitnessPoints) {
        failures.push(`temporal scroll witness moved only ${((firstWitness - lastWitness) / scale).toFixed(1)} points`);
    }

    for (const edgeIndex of [0, 1]) {
        const edgeName = edgeIndex === 0 ? 'top' : 'bottom';
        const signal = summaries.map(summary => summary.signals[edgeIndex]);
        const typicalDetail = median(signal.map(({ detail }) => detail));

        for (let frameIndex = 1; frameIndex < summaries.length - 1; frameIndex++) {
            const previous = signal[frameIndex - 1].luminance;
            const current = signal[frameIndex].luminance;
            const next = signal[frameIndex + 1].luminance;
            const spike = Math.abs(current - (previous + next) / 2);

            if (spike > THRESHOLDS.temporalSpikeMax) {
                failures.push(
                    `${edgeName} temporal band luminance spike at frame ${frameIndex} (${spike.toFixed(1)} levels)`
                );
                break;
            }
        }

        const detailSpike = signal.findIndex(
            ({ detail }) =>
                detail > typicalDetail * THRESHOLDS.temporalDetailRatioMax &&
                detail - typicalDetail > THRESHOLDS.temporalDetailDeltaMin
        );

        if (detailSpike >= 0) {
            failures.push(`${edgeName} temporal band detail spike at frame ${detailSpike}`);
        }
        const inBackdropRange = offsets
            .map((offset, index) => ({ offset, ...signal[index] }))
            .filter(({ offset }) => offset !== undefined && offset >= 0 && offset <= THRESHOLDS.temporalBackdropRangePoints);
        const startRange = inBackdropRange
            .filter(({ offset }) => offset <= 8)
            .map(({ detail, luminance }) => ({ detail, luminance }));
        const endRange = inBackdropRange
            .filter(({ offset }) => offset >= THRESHOLDS.temporalBackdropRangePoints - 8)
            .map(({ detail, luminance }) => ({ detail, luminance }));

        if (startRange.length === 0 || endRange.length === 0) {
            failures.push(`${edgeName} temporal recording does not cover both sides of scroll offsets 0–80`);
            continue;
        }

        const startDetail = median(startRange.map(({ detail }) => detail));
        const endDetail = median(endRange.map(({ detail }) => detail));
        const startLuminance = median(startRange.map(({ luminance }) => luminance));
        const endLuminance = median(endRange.map(({ luminance }) => luminance));
        const detailDrift = Math.abs(endDetail - startDetail) / Math.max(startDetail, 1);
        const luminanceDrift = Math.abs(endLuminance - startLuminance) / 255;

        if (inBackdropRange.length > 1 && Math.max(detailDrift, luminanceDrift) > THRESHOLDS.temporalBackdropDriftMax) {
            failures.push(
                `${edgeName} backdrop changes by ${Math.max(detailDrift, luminanceDrift).toFixed(2)} across scroll offsets 0–80`
            );
        }

        const settledDetail = typicalDetail;
        const detailStep = Math.max(
            ...signal
                .slice(1)
                .map(({ detail }, index) => Math.abs(detail - signal[index].detail) / Math.max(settledDetail, 1))
        );

        if (detailStep > THRESHOLDS.temporalRampStepMax) {
            failures.push(`${edgeName} temporal band energy steps by ${detailStep.toFixed(2)} in one frame`);
        }
    }

    return failures;
};

export const checkTemporalFrames = (frames, background, durationSeconds, rampPoints) => {
    if (frames.length === 0) {
        return [`temporal capture requires at least ${THRESHOLDS.temporalMinimumFrames} frames`];
    }

    const geometry = readRuler(frames[0], rampPoints);
    const summaries = frames.map((frame, frameIndex) => summarizeTemporalFrame(frame, geometry, background, frameIndex));

    return checkTemporalSummaries(summaries, durationSeconds, geometry.scale);
};

export const checkTemporalCaptureDir = temporalDir => {
    if (!existsSync(temporalDir)) {
        return ['temporal capture artifacts are missing'];
    }

    const cells = readdirSync(temporalDir, { withFileTypes: true })
        .filter(entry => entry.isDirectory())
        .map(entry => entry.name);

    if (cells.length !== TEMPORAL_CELLS.length || TEMPORAL_CELLS.some(cell => !cells.includes(cell))) {
        return [`expected temporal captures for ${TEMPORAL_CELLS.join(', ')}, found: ${cells.join(', ')}`];
    }

    return TEMPORAL_CELLS.flatMap(cell => {
        const framePaths = readdirSync(join(temporalDir, cell))
            .filter(file => file.endsWith('.png'))
            .sort()
            .map(file => join(temporalDir, cell, file));
        const background = SCREEN_BACKGROUNDS[cell.split('-')[1]];
        const durationPath = join(temporalDir, cell, 'duration.txt');
        const duration = existsSync(durationPath) ? Number(readFileSync(durationPath, 'utf8').trim()) : 0;
        if (framePaths.length === 0) {
            return [`${cell}: temporal capture requires at least ${THRESHOLDS.temporalMinimumFrames} frames`];
        }

        const firstFrame = PNG.sync.read(readFileSync(framePaths[0]));
        const geometry = readRuler(firstFrame);
        const summaries = [summarizeTemporalFrame(firstFrame, geometry, background, 0)];

        for (const [frameIndex, framePath] of framePaths.slice(1).entries()) {
            summaries.push(
                summarizeTemporalFrame(PNG.sync.read(readFileSync(framePath)), geometry, background, frameIndex + 1)
            );
        }

        return checkTemporalSummaries(summaries, duration, geometry.scale).map(failure => `${cell}: ${failure}`);
    });
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

export const checkCompactCaptureDir = captureDir => {
    const read = name => PNG.sync.read(readFileSync(join(captureDir, `${COMPACT_PREFIX}${name}.png`)));
    const missing = COMPACT_CELLS.filter(
        cell =>
            !['reference', 'scrolled', 'blur-only'].every(state =>
                existsSync(join(captureDir, `${COMPACT_PREFIX}${cell}-${state}.png`))
            )
    );

    if (missing.length > 0) {
        return [`compact band captures are missing for ${missing.join(', ')}`];
    }

    return COMPACT_CELLS.flatMap(cell => {
        const reference = read(`${cell}-reference`);
        const scrolled = read(`${cell}-scrolled`);
        const blurOnly = read(`${cell}-blur-only`);
        const background = SCREEN_BACKGROUNDS[cell.split('-')[1]];
        const geometry = readRuler(reference, COMPACT_RAMP_POINTS);
        const pairedRampFailures = ['top', 'bottom'].flatMap((edgeName, edgeIndex) => {
            const rows =
                edgeIndex === 0
                    ? range(geometry.topChromeEnd, geometry.topBandEnd)
                    : range(geometry.bottomBandStart, geometry.bottomChromeStart).reverse();
            const washedSamples = profile(scrolled, blurOnly, rows, { ...geometry, washWindowPoints: 2 });
            const blurSamples = profile(blurOnly, reference, rows, geometry);
            const blurProgress = blurSamples.map(({ energy }) => Math.min(1, Math.max(0, Math.sqrt(energy))));
            const washProgress = washedSamples.map(({ averageWash }) => {
                const first = washedSamples[0].averageWash;
                const last = washedSamples.at(-1).averageWash;

                return Math.min(1, Math.max(0, (first - averageWash) / Math.max(1, first - last)));
            });
            const mismatch = Math.max(...blurProgress.map((value, index) => Math.abs(value - washProgress[index])));

            return mismatch > COMPACT_WASH_BLUR_MISMATCH_MAX
                ? [`compact ${cell} ${edgeName}: wash and blur ramp differ by ${mismatch.toFixed(2)} of their range`]
                : [];
        });

        return [
            ...checkScrolledCapture(scrolled, reference, background, COMPACT_RAMP_POINTS).map(
                failure => `compact ${cell} scrolled: ${failure}`
            ),
            ...pairedRampFailures,
            ...checkBlurOnlyCapture(blurOnly, reference, COMPACT_RAMP_POINTS).map(
                failure => `compact ${cell} blur-only: ${failure}`
            ),
        ];
    });
};

export const checkCaptureDir = (captureDir, baselineDir, update = false) => {
    const read = name => PNG.sync.read(readFileSync(join(captureDir, `${name}.png`)));
    const cells = readdirSync(captureDir)
        .filter(file => file.endsWith('-reference.png') && !file.startsWith(COMPACT_PREFIX))
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
        const blurOnly = read(`${cell}-blur-only`);
        const rest = read(`${cell}-rest`);
        const background = SCREEN_BACKGROUNDS[cell.split('-')[1]];
        const geometry = readRuler(reference);

        return [
            ...checkBackgroundMetadata(reference, background, geometry.scale).map(
                failure => `${cell} reference: ${failure}`
            ),
            ...checkScrolledCapture(scrolled, reference, background).map(failure => `${cell} scrolled: ${failure}`),
            ...checkBlurOnlyCapture(blurOnly, reference).map(failure => `${cell} blur-only: ${failure}`),
            ...checkRestCapture(rest, reference).map(failure => `${cell} rest: ${failure}`),
            ...checkGolden(`${cell}-scrolled`, scrolled, baselineDir, update),
        ];
    });
};

if (process.argv[1] === fileURLToPath(import.meta.url)) {
    const [captureDir, baselineDir] = process.argv.slice(2);
    const failures = [
        ...checkCaptureDir(captureDir, baselineDir, process.argv.includes('--update')),
        ...checkCompactCaptureDir(captureDir),
        ...checkTemporalCaptureDir(join(captureDir, 'temporal')),
    ];

    for (const failure of failures) {
        console.error(failure);
    }

    console.log(
        failures.length === 0 ? 'edge-fade harness: all checks passed' : `edge-fade harness: ${failures.length} failures`
    );
    process.exitCode = failures.length === 0 ? 0 : 1;
}
