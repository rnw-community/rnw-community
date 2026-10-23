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
