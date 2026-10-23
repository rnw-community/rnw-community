import { expect, test } from '@playwright/test';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const CACHE_DIR = join(__dirname, '..', 'node_modules', '.cache', 'web-e2e');
const BASELINE_DIR = join(__dirname, '..', '..', 'react-native-screen-chrome-example', 'e2e', 'harness', 'baselines');
const SCHEMES = ['dark', 'light'];
const BACKGROUNDS = ['dark', 'light', 'vivid'];
const STATES = ['reference', 'rest', 'scrolled', 'blur-only'];

test.use({ viewport: { width: 402, height: 874 }, deviceScaleFactor: 2 });

test('renders the edge-fade matrix with a measured progressive blur and no hard edge', async ({ page }, { project }) => {
    const captureDir = join(CACHE_DIR, `edge-fade-${project.name}`);

    await page.goto(pathToFileURL(join(CACHE_DIR, 'matrix.html')).href);

    for (const scheme of SCHEMES) {
        for (const background of BACKGROUNDS) {
            for (const state of STATES) {
                await page.screenshot({ path: join(captureDir, `${scheme}-${background}-${state}.png`) });
                await page.getByTestId('edge-fade-harness-state').click();
            }

            await page.getByTestId('edge-fade-harness-background').click();
        }

        await page.getByTestId('edge-fade-harness-scheme').click();
    }

    const { checkCaptureDir } = await import('../../react-native-screen-chrome-example/e2e/harness/edge-fade-metrics.mjs');

    expect(
        checkCaptureDir(
            captureDir,
            join(BASELINE_DIR, `web-${project.name}`),
            process.env.UPDATE_EDGE_FADE_BASELINES === '1'
        )
    ).toEqual([]);
});

test('keeps a compact 56-point band smooth, contained, and unchanged outside its bounds', async ({ page }, { project }) => {
    const captureDir = join(CACHE_DIR, `edge-fade-${project.name}`);

    await page.goto(pathToFileURL(join(CACHE_DIR, 'matrix.html')).href);
    await page.getByTestId('edge-fade-harness-compact').click();
    await page.screenshot({ path: join(captureDir, 'compact-dark-dark-reference.png') });
    await page.getByTestId('edge-fade-harness-state').click();
    await page.getByTestId('edge-fade-harness-state').click();
    await page.screenshot({ path: join(captureDir, 'compact-dark-dark-scrolled.png') });
    await page.getByTestId('edge-fade-harness-state').click();
    await page.screenshot({ path: join(captureDir, 'compact-dark-dark-blur-only.png') });

    const { checkCompactCaptureDir } =
        await import('../../react-native-screen-chrome-example/e2e/harness/edge-fade-metrics.mjs');

    expect(checkCompactCaptureDir(captureDir)).toEqual([]);
});

test('keeps one persistent header backdrop throughout the 0–80 point scroll thresholds', async ({ page }) => {
    await page.goto(pathToFileURL(join(CACHE_DIR, 'matrix.html')).href);
    await page.getByTestId('edge-fade-harness-temporal-prepare').click();

    const backdrop = page.getByTestId('edge-fade-harness-temporal-backdrop');

    await expect(backdrop).toBeVisible();

    for (const offset of [0, 20, 40, 60, 80]) {
        await page.getByTestId('edge-fade-harness').evaluate((content, scrollOffset) => {
            let scrollable = content.parentElement;

            while (scrollable !== null && scrollable.scrollHeight <= scrollable.clientHeight) {
                scrollable = scrollable.parentElement;
            }

            if (scrollable === null) {
                throw new Error('the harness scroll container is missing');
            }

            scrollable.scrollTop = scrollOffset;
        }, offset);
        await page.waitForTimeout(50);

        const opacity = await backdrop.evaluate(element => Number(getComputedStyle(element).opacity));

        expect(opacity, `backdrop remains visible at scroll offset ${offset}`).toBeGreaterThan(0.95);
    }
});
