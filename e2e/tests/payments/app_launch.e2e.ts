import { expect } from 'e2e';

import { byId, expectId, phase, scrollTo } from '../../support/core.ts';
import { launchAndWaitForProbe } from '../../support/payments.ts';
import { test } from '../../support/test.ts';

test('payments app launch', async ({ ctx }) => {
    await launchAndWaitForProbe(ctx);
    await phase('request builder', async () => {
        await expect(byId(ctx, 'builder-total-input')).toHaveValue('20.00');
        await expectId(ctx, 'builder-shipping-toggle');
        await expectId(ctx, 'builder-async-update-toggle');
    });
    await phase('actions and event log', async () => {
        for (const id of ['action-abort', 'action-reset']) {
            await scrollTo(ctx, byId(ctx, id));
            await expectId(ctx, id);
        }
        await scrollTo(ctx, byId(ctx, 'event-log'));
        await expectId(ctx, 'event-log-count');
        await expectId(ctx, 'event-log-row-0');
    });
});
