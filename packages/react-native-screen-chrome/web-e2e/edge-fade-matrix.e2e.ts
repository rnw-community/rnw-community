import { expect, test } from '@playwright/test';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const CACHE_DIR = join(__dirname, '..', 'node_modules', '.cache', 'web-e2e');
const BASELINE_DIR = join(__dirname, '..', '..', 'react-native-screen-chrome-example', 'e2e', 'harness', 'baselines');
const SCHEMES = ['dark', 'light'];
const BACKGROUNDS = ['dark', 'light', 'vivid'];
const STATES = ['reference', 'rest', 'scrolled', 'blur-only'];
const KNOWN_BOTTOM_EDGE_GAP =
    /^(compact )?[a-z-]+ scrolled: scrolled capture: bottom physical edge keeps .* the blur is missing/u;

const splitKnownGap = (failures: readonly string[]) => ({
    known: failures.filter(failure => KNOWN_BOTTOM_EDGE_GAP.test(failure)),
    unexpected: failures.filter(failure => !KNOWN_BOTTOM_EDGE_GAP.test(failure)),
});

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

    const { known, unexpected } = splitKnownGap(
        checkCaptureDir(
            captureDir,
            join(BASELINE_DIR, `web-${project.name}`),
            process.env.UPDATE_EDGE_FADE_BASELINES === '1'
        )
    );

    expect(unexpected).toEqual([]);
    expect(known.length, 'Chromium bottom-edge blur gap (#735) is resolved, remove the known-gap exception').toBeGreaterThan(
        0
    );
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

    const { known, unexpected } = splitKnownGap(checkCompactCaptureDir(captureDir));

    expect(unexpected).toEqual([]);
    expect(known.length, 'Chromium bottom-edge blur gap (#735) is resolved, remove the known-gap exception').toBeGreaterThan(
        0
    );
});

test('keeps the header blur and wash visible throughout the 0–80 point scroll thresholds', async ({ page }) => {
    await page.goto(pathToFileURL(join(CACHE_DIR, 'matrix.html')).href);
    await page.getByTestId('edge-fade-harness-temporal-prepare').click();

    const backdrop = page.getByTestId('edge-fade-harness-temporal-backdrop');
    const visualLayers = backdrop.locator(':scope > div');

    await expect(backdrop).toBeVisible();
    await expect(visualLayers).toHaveCount(2);

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

        const opacities = await visualLayers.evaluateAll(elements =>
            elements.map(element => Number(getComputedStyle(element).opacity))
        );

        expect(opacities, `blur and wash remain visible at scroll offset ${offset}`).toEqual([1, 1]);
    }
});
