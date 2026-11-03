import { expectId, expectNoId, phase, tapId } from '../../support/core.ts';
import { collapseHeader, launchHeaderDemo } from '../../support/collapsible-header.ts';
import { test } from '../../support/test.ts';

test('collapsible header settings header collapses', async ({ ctx }) => {
    await launchHeaderDemo(ctx);
    await phase('open settings', async () => {
        await tapId(ctx, 'header-demo-settings-button');
        await expectId(ctx, 'settings-demo-large-title', 15_000);
        await expectNoId(ctx, 'settings-demo-small-title');
        await expectId(ctx, 'settings-demo-back-button');
    });
    await collapseHeader(ctx, 'settings-demo-small-title');
    await phase('collapsed, then back', async () => {
        await expectNoId(ctx, 'settings-demo-large-title');
        await expectId(ctx, 'settings-demo-back-button');
        await tapId(ctx, 'settings-demo-back-button');
        await expectId(ctx, 'header-demo-expanded-amount', 15_000);
    });
});
