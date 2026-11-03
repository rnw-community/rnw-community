import { expect } from 'e2e';

import { byId, expectId, expectIdText, phase, scrollTo } from '../../support/core.ts';
import { expectLog, launchAndWaitForProbe } from '../../support/payments.ts';
import { test } from '../../support/test.ts';

test('payments canMakePayment probe', async ({ ctx }) => {
    await launchAndWaitForProbe(ctx);
    await phase('probe result', async () => {
        if (ctx.platform === 'ios') {
            await expectIdText(ctx, 'payments-can-make-status', 'available');
            await expectLog(ctx, 'canMakePayment: status=available');
            return;
        }
        await expect(byId(ctx, 'payments-can-make-status')).not.toHaveText('checking');
        await expectId(ctx, 'action-show');
        await scrollTo(ctx, byId(ctx, 'event-log-count'));
        await expectId(ctx, 'event-log-count');
    });
});
