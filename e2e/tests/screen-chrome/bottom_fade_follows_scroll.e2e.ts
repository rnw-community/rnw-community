import { expectId, swipePercent } from '../../support/core.ts';
import { openDemo } from '../../support/screen-chrome.ts';
import { test } from '../../support/test.ts';

test('screen chrome bottom fade follows scroll', async ({ ctx }) => {
    await openDemo(ctx, 'bottom-fade', 'bottom-fade-demo-title');
    await swipePercent(ctx, [50, 70], [50, 30], 900);
    await expectId(ctx, 'bottom-fade-demo-fade');
    await expectId(ctx, 'bottom-fade-demo-title');
});
