import { collapseThenExpand, openDemo } from '../../support/screen-chrome.ts';
import { test } from '../../support/test.ts';

test('screen chrome collapsible header expands on scroll back', async ({ ctx }) => {
    await openDemo(ctx, 'collapsible', 'collapsible-demo-expanded-title');
    await collapseThenExpand(ctx, 'collapsible-demo');
});
