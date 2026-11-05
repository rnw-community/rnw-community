import { byId, captureScreen, expectId, expectIdText, scrollTo, sleep, tapId, type Ctx } from '../../support/core.ts';
import { launchHome } from '../../support/screen-chrome.ts';
import { test } from '../../support/test.ts';

const toggle = (ctx: Ctx, name: string): Promise<void> => tapId(ctx, `playground-toggle-${name}`);

/** The blur and wash settle after the tree already has. */
async function capture(ctx: Ctx, name: string): Promise<void> {
    await sleep(1_000);
    await captureScreen(ctx, `playground/${name}`);
}

async function captureWithout(ctx: Ctx, name: string, capturedAs: string): Promise<void> {
    await toggle(ctx, name);
    await capture(ctx, capturedAs);
    await toggle(ctx, name);
}

/** The four variants `playground-metrics.mjs` compares at one scheme and scroll offset. */
async function captureCell(ctx: Ctx, cell: string): Promise<void> {
    await captureWithout(ctx, 'chrome', `${cell}-reference`);
    await capture(ctx, `${cell}-budgie`);
    await captureWithout(ctx, 'wash', `${cell}-blur-only`);
    await captureWithout(ctx, 'blur', `${cell}-wash-only`);
}

async function captureScheme(ctx: Ctx, scheme: string): Promise<void> {
    await captureCell(ctx, `${scheme}-rest`);
    await toggle(ctx, 'scroll');
    await captureCell(ctx, `${scheme}-scrolled`);
    await toggle(ctx, 'scroll');
}

/** Taps a slider's track `percent` of the way along, at half height. */
async function setSlider(ctx: Ctx, id: string, percent: number): Promise<void> {
    const track = byId(ctx, `playground-slider-${id}`);
    const box = await track.boundingBox();
    if (box === null) {
        throw new Error(`${id} has no box`);
    }
    await track.tap({ position: { x: Math.min((box.width * percent) / 100, box.width - 1), y: box.height / 2 } });
}

/** `dark-scrolled-alpha-<percent>`: the solid and wash alpha sliders both at `percent`, reading `value`. */
async function captureAlpha(ctx: Ctx, percent: number, value: string): Promise<void> {
    await toggle(ctx, 'panel');
    for (const layer of ['solid', 'wash']) {
        await setSlider(ctx, `${layer}-alpha`, percent);
        await expectIdText(ctx, `playground-slider-${layer}-alpha-value`, new RegExp(`${layer} alpha ${value}$`, 'u'));
    }
    await toggle(ctx, 'panel');
    await capture(ctx, `dark-scrolled-alpha-${percent}`);
}

/** The captures `packages/react-native-screen-chrome-example/e2e/harness/playground-metrics.mjs` measures. */
test('screen chrome playground matrix', async ({ ctx }) => {
    await launchHome(ctx);
    await scrollTo(ctx, byId(ctx, 'home-open-playground'));
    await tapId(ctx, 'home-open-playground');
    await expectId(ctx, 'playground-preset-budgie', 15_000);
    await tapId(ctx, 'playground-preset-budgie');

    await captureScheme(ctx, 'dark');
    await toggle(ctx, 'scheme');
    await captureScheme(ctx, 'light');
    await toggle(ctx, 'scheme');

    await toggle(ctx, 'scroll');
    await captureAlpha(ctx, 0, '0');
    await captureAlpha(ctx, 35, '0\\.3[3-7]');
    await captureAlpha(ctx, 70, '0\\.(6[89]|7[0-2]?)');
    await captureAlpha(ctx, 100, '1');

    await tapId(ctx, 'playground-preset-budgie');
    await toggle(ctx, 'panel');
    await setSlider(ctx, 'topHeight', 48);
    await setSlider(ctx, 'bottomHeight', 60);
    await toggle(ctx, 'panel');
    await capture(ctx, 'dark-scrolled-tall');
});
