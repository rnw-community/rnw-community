import { expectIdText, swipePercent, tapId } from '../../support/core.ts';
import { openDemo } from '../../support/screen-chrome.ts';
import { test } from '../../support/test.ts';

test('screen chrome tab bar switches tabs', async ({ ctx }) => {
    await openDemo(ctx, 'tab-bar', 'tab-demo-tab-search');
    await tapId(ctx, 'tab-demo-tab-search');
    await expectIdText(ctx, 'tab-demo-title', 'Search');
    await swipePercent(ctx, [50, 70], [50, 30], 900);
    await tapId(ctx, 'tab-demo-tab-profile');
    await expectIdText(ctx, 'tab-demo-title', 'Profile');
});
