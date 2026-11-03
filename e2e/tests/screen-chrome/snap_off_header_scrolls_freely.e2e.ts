import { collapseThenExpand, openDemo } from '../../support/screen-chrome.ts';
import { test } from '../../support/test.ts';

test('screen chrome snap-off header scrolls freely', async ({ ctx }) => {
    await openDemo(ctx, 'snap-off', 'snap-off-demo-expanded-title');
    await collapseThenExpand(ctx, 'snap-off-demo');
});
