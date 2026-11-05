import { leaseIdForUdid, mustExec, simlockApiFromEnv } from '@mobile-ci/e2e-simlock/exec';
import { done } from '@mobile-ci/e2e-simlock/steps';

import { expectId, sleep, swipePercent, tapId } from '../../support/core.ts';
import { onPixel, recordClip } from '../../support/media.ts';
import { openDemo } from '../../support/screen-chrome.ts';
import { test } from '../../support/test.ts';

const docs = (name: string): string => `react-native-screen-chrome/docs/${name}`;

test('screen chrome collapsible header clip', async ({ ctx: raw }) => {
    const ctx = onPixel(raw);
    await openDemo(ctx, 'collapsible', 'collapsible-demo-expanded-title');
    await recordClip(ctx, docs('collapsible-header'), async () => {
        await swipePercent(ctx, [50, 80], [50, 30], 900);
        await swipePercent(ctx, [50, 80], [50, 30], 900);
        await sleep(2_000);
        await swipePercent(ctx, [50, 30], [50, 85], 900);
        await sleep(2_000);
    });
});

test('screen chrome static header clip', async ({ ctx: raw }) => {
    const ctx = onPixel(raw);
    await openDemo(ctx, 'static-header', 'static-demo-title');
    await recordClip(ctx, docs('static-header'), async () => {
        await swipePercent(ctx, [50, 75], [50, 30], 1_200);
        await swipePercent(ctx, [50, 30], [50, 75], 1_200);
    });
});

test('screen chrome header and footer clip', async ({ ctx: raw }) => {
    const ctx = onPixel(raw);
    await openDemo(ctx, 'footer', 'footer-demo-total');
    await recordClip(ctx, docs('header-and-footer'), async () => {
        await swipePercent(ctx, [50, 60], [50, 20], 1_200);
        await swipePercent(ctx, [50, 30], [50, 70], 1_200);
    });
});

test('screen chrome snap off clip', async ({ ctx: raw }) => {
    const ctx = onPixel(raw);
    await openDemo(ctx, 'snap-off', 'snap-off-demo-expanded-title');
    await recordClip(ctx, docs('snap-off'), async () => {
        await swipePercent(ctx, [50, 70], [50, 62], 1_200);
        await sleep(1_500);
        await swipePercent(ctx, [50, 62], [50, 30], 1_200);
        await swipePercent(ctx, [50, 30], [50, 80], 1_200);
    });
});

test('screen chrome bottom fade clip', async ({ ctx: raw }) => {
    const ctx = onPixel(raw);
    await openDemo(ctx, 'bottom-fade', 'bottom-fade-demo-title');
    await recordClip(ctx, docs('bottom-fade'), async () => {
        await swipePercent(ctx, [50, 70], [50, 40], 1_500);
        await swipePercent(ctx, [50, 40], [50, 75], 1_500);
    });
});

test('screen chrome tab bar clip', async ({ ctx: raw }) => {
    const ctx = onPixel(raw);
    await openDemo(ctx, 'tab-bar', 'tab-demo-tab-search');
    await recordClip(ctx, docs('tab-bar'), async () => {
        await swipePercent(ctx, [50, 70], [50, 30], 1_200);
        await tapId(ctx, 'tab-demo-tab-search');
        await tapId(ctx, 'tab-demo-tab-profile');
        await swipePercent(ctx, [50, 30], [50, 70], 1_200);
    });
});

test('screen chrome keyboard footer clip', async ({ ctx: raw }) => {
    const ctx = onPixel(raw);
    await openDemo(ctx, 'keyboard', 'keyboard-demo-input');
    // agent-device selects its own input method when the app launches, and it draws nothing. The clip exists to show the
    // real keyboard, so select that afterwards and type through the shell, because agent-device's typing switches back.
    const api = simlockApiFromEnv();
    const lease = await leaseIdForUdid(api, ctx.device.unstable_raw.deviceId);
    await mustExec(api, lease, ['shell', 'ime set com.google.android.inputmethod.latin/com.android.inputmethod.latin.LatinIME']);
    await sleep(1_500);
    await recordClip(ctx, docs('keyboard-footer'), async () => {
        await tapId(ctx, 'keyboard-demo-input');
        await sleep(3_000);
        await mustExec(api, lease, ['shell', 'input text hello']);
        await sleep(1_000);
        await tapId(ctx, 'keyboard-demo-send');
        await done(ctx);
        await expectId(ctx, 'keyboard-demo-last-sent');
        await sleep(1_500);
    });
});

test('screen chrome light and dark clip', async ({ ctx: raw }) => {
    const ctx = onPixel(raw);
    await openDemo(ctx, 'theme', 'theme-demo-scheme');
    await recordClip(ctx, docs('light-dark'), async () => {
        await swipePercent(ctx, [50, 60], [50, 40], 1_000);
        await tapId(ctx, 'theme-demo-toggle');
        await sleep(2_000);
        await tapId(ctx, 'theme-demo-toggle');
        await sleep(2_000);
    });
});
