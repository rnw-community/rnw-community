import { expectId, expectNoId, phase, tapId, tapUntil } from '../../support/core.ts';
import { collapseHeader, launchHeaderDemo } from '../../support/collapsible-header.ts';
import { test } from '../../support/test.ts';

test('collapsible header freeze preserves the collapsed state', async ({ ctx }) => {
    await launchHeaderDemo(ctx);
    await collapseHeader(ctx, 'header-demo-collapsed-amount');
    await phase('details and back', async () => {
        await tapUntil(ctx, 'header-demo-details-button', () => expectId(ctx, 'header-demo-details-title', 15_000));
        await tapId(ctx, 'header-demo-details-back-button');
        await expectId(ctx, 'header-demo-collapsed-amount', 15_000);
        await expectNoId(ctx, 'header-demo-expanded-amount');
    });
});
