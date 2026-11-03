import { expectId, expectNoId } from '../../support/core.ts';
import { launchHeaderDemo } from '../../support/collapsible-header.ts';
import { test } from '../../support/test.ts';

test('collapsible header app launch', async ({ ctx }) => {
    await launchHeaderDemo(ctx);
    await expectId(ctx, 'header-demo-expanded-amount');
    await expectId(ctx, 'header-demo-details-button');
    await expectId(ctx, 'header-demo-item-1');
    await expectNoId(ctx, 'header-demo-collapsed-amount');
});
