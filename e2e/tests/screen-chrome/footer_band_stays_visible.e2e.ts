import { expectId, swipePercent } from '../../support/core.ts';
import { openDemo } from '../../support/screen-chrome.ts';
import { test } from '../../support/test.ts';

test('screen chrome footer band stays visible', async ({ ctx }) => {
    await openDemo(ctx, 'footer', 'footer-demo-total');
    for (let swipe = 0; swipe < 2; swipe++) {
        await swipePercent(ctx, [50, 60], [50, 20], 900);
    }
    await expectId(ctx, 'footer-demo-band');
    await expectId(ctx, 'footer-demo-total');
    await expectId(ctx, 'footer-demo-header');
});
