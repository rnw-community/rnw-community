import { expectId, expectNoId, phase, swipePercent } from '../../support/core.ts';
import { collapseHeader, launchHeaderDemo } from '../../support/collapsible-header.ts';
import { test } from '../../support/test.ts';

test('collapsible header expands on scroll back', async ({ ctx }) => {
    await launchHeaderDemo(ctx);
    await collapseHeader(ctx, 'header-demo-collapsed-amount');
    await phase('scroll back', async () => {
        for (let swipe = 0; swipe < 3; swipe++) {
            await swipePercent(ctx, [50, 40], [50, 80], 900);
        }
        await expectId(ctx, 'header-demo-expanded-amount', 15_000);
        await expectNoId(ctx, 'header-demo-collapsed-amount');
    });
});
