import { byId, expectId, phase, scrollTo, tapId } from '../../support/core.ts';
import { dismissIosSheet, expectLog, expectRejected, launchAndWaitForProbe, showRequest } from '../../support/payments.ts';
import { test } from '../../support/test.ts';

test('payments sheet opens on show', async ({ ctx }) => {
    await launchAndWaitForProbe(ctx);
    await showRequest(ctx);
    await dismissIosSheet(ctx);
    await phase('show settles rejected', async () => {
        await expectLog(ctx, 'show called');
        if (ctx.platform === 'android') {
            // On a GMS device the show() outcome belongs to Google Pay, not the app: the only settlement this test
            // can assert deterministically is the AbortError abort() forces from the JS side.
            await scrollTo(ctx, byId(ctx, 'action-abort'), 'up');
            await tapId(ctx, 'action-abort');
            await expectRejected(ctx);
        }
        await expectLog(ctx, 'show rejected');
        await scrollTo(ctx, byId(ctx, 'action-reset'), 'up');
        await expectId(ctx, 'action-reset');
    });
});
