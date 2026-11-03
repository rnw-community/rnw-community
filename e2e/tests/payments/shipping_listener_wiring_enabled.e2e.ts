import { launchAndWaitForProbe, dismissIosSheet, expectLog, showRequest } from '../../support/payments.ts';
import { test } from '../../support/test.ts';

test('payments shipping listener wiring enabled', async ({ ctx }) => {
    await launchAndWaitForProbe(ctx);
    await showRequest(ctx);
    await dismissIosSheet(ctx);
    await expectLog(ctx, 'listeners attached: types=paymentmethodchange,shippingaddresschange,shippingoptionchange');
});
