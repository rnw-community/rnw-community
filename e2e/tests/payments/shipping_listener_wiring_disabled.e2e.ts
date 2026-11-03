import { expect } from 'e2e';

import { containingText, phase, tapId } from '../../support/core.ts';
import { dismissIosSheet, expectLog, launchAndWaitForProbe, showRequest } from '../../support/payments.ts';
import { test } from '../../support/test.ts';

test('payments shipping listener wiring disabled', async ({ ctx }) => {
    await launchAndWaitForProbe(ctx);
    await tapId(ctx, 'builder-shipping-toggle');
    await showRequest(ctx);
    await dismissIosSheet(ctx);
    await phase('listeners', async () => {
        await expectLog(ctx, 'listeners attached: types=paymentmethodchange');
        await expect(containingText(ctx, 'shippingaddresschange')).toBeHidden();
    });
});
