import { expect, test } from '@playwright/test';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

import type { Page } from '@playwright/test';

const HARNESS_URL = pathToFileURL(join(__dirname, '..', 'node_modules', '.cache', 'web-e2e', 'index.html')).href;
const BAND_HEIGHT = 76;
const SCREEN_HEIGHT = 600;
const EDGE_STRIP_HEIGHT = 12;
const BLUR_RADII = ['22.5px', '11.25px', '5.625px', '2.8125px'];
const SLICE_HEIGHT = BAND_HEIGHT / 4;

type Position = 'top' | 'bottom';

interface LayerStyle {
    readonly top: number;
    readonly height: number;
    readonly backdropFilter: string;
    readonly maskImage: string;
    readonly maskSize: string;
    readonly maskPosition: string;
    readonly backgroundImage: string;
    readonly opacity: string;
}

const readBand = async (page: Page, position: Position) =>
    page.evaluate(testID => {
        const band = document.querySelector<HTMLElement>(`[data-testid="${testID}"]`);

        if (band === null) {
            throw new Error(`${testID} is not rendered`);
        }

        const { top, height } = band.getBoundingClientRect();
        const layers = [...band.children].map(child => {
            const style = getComputedStyle(child);
            const rect = child.getBoundingClientRect();

            return {
                top: rect.top,
                height: rect.height,
                backdropFilter: style.backdropFilter,
                maskImage: style.maskImage,
                maskSize: style.maskSize,
                maskPosition: style.maskPosition,
                backgroundImage: style.backgroundImage,
                opacity: style.opacity,
            };
        });
        const backdropRootAncestors: string[] = [];

        for (let ancestor: HTMLElement | null = band; ancestor !== null; ancestor = ancestor.parentElement) {
            const style = getComputedStyle(ancestor);

            if (style.opacity !== '1' || style.filter !== 'none' || style.maskImage !== 'none') {
                backdropRootAncestors.push(ancestor.tagName);
            }
        }

        return { top, height, layers, backdropRootAncestors };
    }, `${position}-fade`);

const readEdgeSharpness = async (page: Page, rowStart: number): Promise<number> => {
    const screenshot = await page.screenshot({ clip: { x: 0, y: rowStart, width: 400, height: EDGE_STRIP_HEIGHT } });

    return page.evaluate(
        async dataUrl => {
            const image = new Image();

            image.src = dataUrl;
            await image.decode();

            const canvas = document.createElement('canvas');

            canvas.width = image.width;
            canvas.height = image.height;

            const context = canvas.getContext('2d');

            if (context === null) {
                throw new Error('2d canvas is unavailable');
            }

            context.drawImage(image, 0, 0);

            const { data, width, height } = context.getImageData(0, 0, image.width, image.height);
            let energy = 0;

            for (let row = 0; row < height; row++) {
                for (let column = 1; column < width; column++) {
                    const index = (row * width + column) * 4;

                    energy += Math.abs(data[index] - data[index - 4]);
                }
            }

            return energy / (width * height);
        },
        `data:image/png;base64,${screenshot.toString('base64')}`
    );
};

const setScrollY = async (page: Page, offset: number): Promise<void> => {
    await page.evaluate(value => window.setEdgeFadeScrollY?.(value), offset);
};

const getBlurLayers = (layers: readonly LayerStyle[]): LayerStyle[] =>
    layers.filter(layer => layer.backdropFilter !== 'none');

test.beforeEach(async ({ page }) => {
    await page.goto(HARNESS_URL);
    await expect(page.getByTestId('top-fade')).toBeAttached();
});

for (const position of ['top', 'bottom'] as const) {
    test.describe(`${position} edge fade`, () => {
        test('sits at its screen edge with the web band height', async ({ page }) => {
            const band = await readBand(page, position);

            expect(band.height).toBe(BAND_HEIGHT);
            expect(band.top).toBe(position === 'top' ? 0 : SCREEN_HEIGHT - BAND_HEIGHT);
        });

        test('steps four backdrop blurs whose radius halves away from the edge', async ({ page }) => {
            const blurLayers = getBlurLayers((await readBand(page, position)).layers);

            expect(blurLayers.map(layer => layer.backdropFilter)).toStrictEqual(
                BLUR_RADII.map(radius => `blur(${radius}) saturate(1.08)`)
            );
        });

        test('lays the blurs out as edge-to-inside quarter slices that never overlap', async ({ page }) => {
            const band = await readBand(page, position);
            const sliceTops = getBlurLayers(band.layers).map(layer => layer.top - band.top);

            expect(getBlurLayers(band.layers).map(layer => layer.height)).toStrictEqual(Array(4).fill(SLICE_HEIGHT));
            expect(sliceTops).toStrictEqual([0, 1, 2, 3].map(step => (position === 'top' ? step : 3 - step) * SLICE_HEIGHT));
        });

        test('masks every blur slice with its own quarter of the wash edge mask', async ({ page }) => {
            const { layers } = await readBand(page, position);
            const wash = layers[layers.length - 1];
            const blurLayers = getBlurLayers(layers);
            const quarterPositions = ['0% 0%', '0% 33.3333%', '0% 66.6667%', '0% 100%'];

            for (const layer of blurLayers) {
                expect(layer.maskImage).toBe(wash.maskImage);
                expect(layer.maskSize).toBe('100% 400%');
            }

            expect(blurLayers.map(layer => layer.maskPosition)).toStrictEqual(
                position === 'top' ? quarterPositions : [...quarterPositions].reverse()
            );
            expect(wash.maskImage).toBe(
                position === 'top'
                    ? 'linear-gradient(rgba(0, 0, 0, 0.99) 0%, rgb(0, 0, 0) 50%, rgba(0, 0, 0, 0) 100%)'
                    : 'linear-gradient(rgba(0, 0, 0, 0) 0%, rgb(0, 0, 0) 50%, rgba(0, 0, 0, 0.99) 100%)'
            );
        });

        test('paints the wash above the blurs, solid at the edge and transparent inward', async ({ page }) => {
            const { layers } = await readBand(page, position);
            const wash = layers[layers.length - 1];

            expect(layers).toHaveLength(5);
            expect(wash.backdropFilter).toBe('none');
            expect(wash.backgroundImage).toBe(
                position === 'top'
                    ? 'linear-gradient(rgba(255, 255, 255, 0.42) 0%, rgba(255, 255, 255, 0.08) 72%, rgba(0, 0, 0, 0) 100%)'
                    : 'linear-gradient(rgba(0, 0, 0, 0) 0%, rgba(255, 255, 255, 0.08) 28%, rgba(255, 255, 255, 0.42) 100%)'
            );
        });

        test('keeps every ancestor free of opacity, filter, and mask so the blurs sample the page', async ({ page }) => {
            await setScrollY(page, 40);

            expect((await readBand(page, position)).backdropRootAncestors).toStrictEqual([]);
        });
    });
}

test('blurs the content under the top edge relative to the same content outside the band', async ({ page }) => {
    const edgeSharpness = await readEdgeSharpness(page, 0);
    const contentSharpness = await readEdgeSharpness(page, 288);

    expect(contentSharpness).toBeGreaterThan(0);
    expect(edgeSharpness).toBeLessThan(contentSharpness * 0.25);
});

test('fades the scroll-animated bottom layers with the scroll offset while the container stays opaque', async ({ page }) => {
    const bottomEdgeRow = SCREEN_HEIGHT - EDGE_STRIP_HEIGHT;
    const contentSharpness = await readEdgeSharpness(page, 288);

    for (const [offset, opacity] of [
        [0, '0'],
        [40, '0.5'],
        [80, '1'],
    ] as const) {
        await setScrollY(page, offset);

        await expect
            .poll(async () => (await readBand(page, 'bottom')).layers.map(layer => layer.opacity))
            .toStrictEqual(Array(5).fill(opacity));
    }

    expect(await readEdgeSharpness(page, bottomEdgeRow)).toBeLessThan(contentSharpness * 0.25);

    await setScrollY(page, 0);
    await expect.poll(async () => (await readBand(page, 'bottom')).layers[0].opacity).toBe('0');

    expect(await readEdgeSharpness(page, bottomEdgeRow)).toBeGreaterThan(contentSharpness * 0.5);
    expect((await readBand(page, 'top')).layers.map(layer => layer.opacity)).toStrictEqual(Array(5).fill('1'));
});
