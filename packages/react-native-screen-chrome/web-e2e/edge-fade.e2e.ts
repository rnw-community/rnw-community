import { expect, test } from '@playwright/test';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

import type { Page } from '@playwright/test';

const HARNESS_URL = pathToFileURL(join(__dirname, '..', 'node_modules', '.cache', 'web-e2e', 'index.html')).href;
const BAND_HEIGHT = 76;
const SCREEN_HEIGHT = 600;
const EDGE_STRIP_HEIGHT = 12;
const BLUR_RADII = ['22.5px'];
const MAX_ROW_STEP = 0.15;
const STRIPES_LEFT = 200;

type Position = 'top' | 'bottom';

interface LayerStyle {
    readonly top: number;
    readonly height: number;
    readonly backdropFilter: string;
    readonly maskImage: string;
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

const readRowContrast = async (page: Page, left: number): Promise<number[]> => {
    const screenshot = await page.screenshot();

    return page.evaluate(
        async ({ dataUrl, cssLeft, cssHeight }) => {
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
            const scale = height / cssHeight;
            const firstColumn = Math.round(cssLeft * scale) + 1;

            return Array.from({ length: cssHeight }, (_, cssRow) => {
                let energy = 0;

                for (let row = Math.round(cssRow * scale); row < Math.round((cssRow + 1) * scale); row++) {
                    for (let column = firstColumn; column < width; column++) {
                        const index = (row * width + column) * 4;

                        energy += Math.abs(data[index] - data[index - 4]);
                    }
                }

                return energy / (width - firstColumn) / scale;
            });
        },
        { dataUrl: `data:image/png;base64,${screenshot.toString('base64')}`, cssLeft: left, cssHeight: SCREEN_HEIGHT }
    );
};

const readEdgeSharpness = async (page: Page, rowStart: number): Promise<number> =>
    (await readRowContrast(page, 0))
        .slice(rowStart, rowStart + EDGE_STRIP_HEIGHT)
        .reduce((sum, contrast) => sum + contrast, 0) / EDGE_STRIP_HEIGHT;

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

        test('blends the full blur radius through an eased mask', async ({ page }) => {
            const blurLayers = getBlurLayers((await readBand(page, position)).layers);

            expect(blurLayers.map(layer => layer.backdropFilter)).toStrictEqual(
                BLUR_RADII.map(radius => `blur(${radius}) saturate(1.08)`)
            );
        });

        test('ramps the blur in from the plateau without a hard edge', async ({ page }) => {
            await setScrollY(page, 80);

            const band = await readBand(page, position);
            const contrast = await readRowContrast(page, STRIPES_LEFT);
            const baseline = contrast[SCREEN_HEIGHT / 2];
            const bandRows = contrast.slice(Math.max(band.top, 0), band.top + band.height);
            const inwardRows = position === 'top' ? bandRows : [...bandRows].reverse();
            const rowSteps = inwardRows.slice(1).map((row, index) => row - inwardRows[index]);

            expect(inwardRows[0]).toBeLessThan(baseline * 0.1);
            expect(inwardRows[inwardRows.length - 1]).toBeGreaterThan(baseline * 0.95);
            expect(Math.min(...rowSteps)).toBeGreaterThan(-baseline * 0.1);
            expect(Math.max(...rowSteps)).toBeLessThan(baseline * MAX_ROW_STEP);
        });

        test('paints the wash above the blurs, solid at the edge and transparent inward', async ({ page }) => {
            const { layers } = await readBand(page, position);
            const wash = layers[layers.length - 1];

            expect(layers).toHaveLength(2);
            expect(wash.backdropFilter).toBe('none');
            expect(wash.backgroundImage).toBe('linear-gradient(color(srgb 1 1 1) 0%, color(srgb 1 1 1) 100%)');
        });

        test('resolves the rendered CSS variable to an opaque wash color', async ({ page }) => {
            const { layers } = await readBand(page, position);

            expect(layers.at(-1)?.backgroundImage).toBe('linear-gradient(color(srgb 1 1 1) 0%, color(srgb 1 1 1) 100%)');
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
            .toStrictEqual(Array(2).fill(opacity));
    }

    expect(await readEdgeSharpness(page, bottomEdgeRow)).toBeLessThan(contentSharpness * 0.25);

    await setScrollY(page, 0);
    await expect.poll(async () => (await readBand(page, 'bottom')).layers[0].opacity).toBe('0');

    expect(await readEdgeSharpness(page, bottomEdgeRow)).toBeGreaterThan(contentSharpness * 0.5);
    expect((await readBand(page, 'top')).layers.map(layer => layer.opacity)).toStrictEqual(Array(2).fill('1'));
});
