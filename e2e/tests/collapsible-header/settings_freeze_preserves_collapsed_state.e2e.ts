import { expectId, expectNoId, phase, tapId, tapUntil } from '../../support/core.ts';
import { collapseHeader, launchHeaderDemo } from '../../support/collapsible-header.ts';
import { test } from '../../support/test.ts';

test('collapsible header settings freeze preserves the collapsed state', async ({ ctx }) => {
    await launchHeaderDemo(ctx);
    await tapId(ctx, 'header-demo-settings-button');
    await expectId(ctx, 'settings-demo-large-title', 15_000);
    await collapseHeader(ctx, 'settings-demo-small-title');
    await phase('details and back', async () => {
        await tapUntil(ctx, 'settings-demo-item-8', () => expectId(ctx, 'header-demo-details-title', 15_000));
        await tapId(ctx, 'header-demo-details-back-button');
        await expectId(ctx, 'settings-demo-small-title', 15_000);
        await expectNoId(ctx, 'settings-demo-large-title');
    });
});
