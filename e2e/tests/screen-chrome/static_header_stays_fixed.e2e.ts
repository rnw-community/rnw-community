import { expectId, swipePercent } from '../../support/core.ts';
import { openDemo } from '../../support/screen-chrome.ts';
import { test } from '../../support/test.ts';

test('screen chrome static header stays fixed', async ({ ctx }) => {
    await openDemo(ctx, 'static-header', 'static-demo-title');
    for (let swipe = 0; swipe < 2; swipe++) {
        await swipePercent(ctx, [50, 80], [50, 30], 900);
    }
    await expectId(ctx, 'static-demo-title');
    await expectId(ctx, 'static-demo-top-fade');
});
