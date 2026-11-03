import { byId, phase, scrollTo, tapId } from '../../support/core.ts';
import { dismissIosSheet, expectLog, expectRejected, launchAndWaitForProbe, showRequest } from '../../support/payments.ts';
import { test } from '../../support/test.ts';

test('payments dismiss, abort and reject state', async ({ ctx }) => {
    await launchAndWaitForProbe(ctx);
    await showRequest(ctx);
    await dismissIosSheet(ctx);
    await phase('abort', async () => {
        await scrollTo(ctx, byId(ctx, 'action-abort'));
        await tapId(ctx, 'action-abort');
        await expectRejected(ctx);
        await expectLog(ctx, 'abort called');
    });
});
