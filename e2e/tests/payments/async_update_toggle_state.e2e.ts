import { phase, tapId } from '../../support/core.ts';
import { dismissIosSheet, expectLog, launchAndWaitForProbe, showRequest } from '../../support/payments.ts';
import { test } from '../../support/test.ts';

test('payments async update toggle state', async ({ ctx }) => {
    await launchAndWaitForProbe(ctx);
    await tapId(ctx, 'builder-async-update-toggle');
    await showRequest(ctx);
    await dismissIosSheet(ctx);
    await phase('event log', async () => {
        await expectLog(ctx, 'listeners attached');
        await expectLog(ctx, 'request created');
    });
});
