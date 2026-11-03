import { expectId, expectNoId, snapDrag } from '../../support/core.ts';
import { launchHeaderDemo } from '../../support/collapsible-header.ts';
import { test } from '../../support/test.ts';

test('collapsible header snaps to the nearest endpoint', async ({ ctx }) => {
    await launchHeaderDemo(ctx);
    await snapDrag(ctx);
    await expectId(ctx, 'header-demo-collapsed-amount', 15_000);
    await expectNoId(ctx, 'header-demo-expanded-amount');
});
