import { expectId, expectNoId } from '../../support/core.ts';
import { collapseHeader, launchHeaderDemo } from '../../support/collapsible-header.ts';
import { test } from '../../support/test.ts';

test('collapsible header collapses on scroll', async ({ ctx }) => {
    await launchHeaderDemo(ctx);
    await collapseHeader(ctx, 'header-demo-collapsed-amount');
    await expectNoId(ctx, 'header-demo-expanded-amount');
    await expectId(ctx, 'header-demo-details-button');
});
