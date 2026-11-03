import { byId, expectId, expectIdText, phase, scrollTo, tapId } from '../../support/core.ts';
import { dismissIosSheet, expectLog, expectRejected, launchAndWaitForProbe, showRequest } from '../../support/payments.ts';
import { test } from '../../support/test.ts';

test('payments reset and new request state transitions', async ({ ctx }) => {
    await launchAndWaitForProbe(ctx);
    await expectIdText(ctx, 'payments-flow-state', 'idle');
    await showRequest(ctx);
    await dismissIosSheet(ctx);
    await phase('reject', async () => {
        if (ctx.platform === 'android') {
            await scrollTo(ctx, byId(ctx, 'action-abort'));
            await tapId(ctx, 'action-abort');
        }
        await expectRejected(ctx);
    });
    await phase('reset', async () => {
        await scrollTo(ctx, byId(ctx, 'action-reset'));
        await tapId(ctx, 'action-reset');
        await scrollTo(ctx, byId(ctx, 'payments-flow-state'), 'up');
        await expectIdText(ctx, 'payments-flow-state', 'idle');
        await expectLog(ctx, 'request reset');
    });
    await showRequest(ctx);
    if (ctx.platform === 'ios') {
        await expectId(ctx, 'dismiss', 120_000);
    }
});
