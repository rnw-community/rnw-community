import { expect } from 'e2e';

import { keep, phase, sleep, stopRecording, tapId } from '../../support/core.ts';
import { launchAndWaitForProbe } from '../../support/payments.ts';
import { test } from '../../support/test.ts';

/** The docs media (`google-pay-sheet.mp4`): the Google Pay sheet opening over the example app, then dismissed. */
test('payments Google Pay sheet capture', async ({ ctx }) => {
    await launchAndWaitForProbe(ctx);
    await ctx.app.startRecording({ name: 'google-pay-sheet' });
    await phase('sheet', async () => {
        await tapId(ctx, 'action-show');
        await expect
            .poll(async () => (await ctx.device.foregroundApp()).bundleId, { timeout: 15_000 })
            .toBe('com.google.android.gms');
        await sleep(2_000);
        await keep(await ctx.app.screenshot('google-pay-sheet'), 'recording/google-pay-sheet');
        await ctx.device.back();
        await sleep(2_000);
    });
    await keep(await stopRecording(ctx), 'recording/google-pay-sheet');
});
