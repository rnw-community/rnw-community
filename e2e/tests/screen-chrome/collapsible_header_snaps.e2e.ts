import { expectId, snapDrag } from '../../support/core.ts';
import { openDemo } from '../../support/screen-chrome.ts';
import { test } from '../../support/test.ts';

test('screen chrome collapsible header snaps', async ({ ctx }) => {
    await openDemo(ctx, 'collapsible', 'collapsible-demo-expanded-title');
    await snapDrag(ctx);
    await expectId(ctx, 'collapsible-demo-collapsed-title', 15_000);
});
