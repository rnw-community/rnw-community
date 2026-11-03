import { expectId, expectIdText, tapId } from '../../support/core.ts';
import { launchHome } from '../../support/screen-chrome.ts';
import { test } from '../../support/test.ts';

test('screen chrome theme switches scheme', async ({ ctx }) => {
    await launchHome(ctx);
    await tapId(ctx, 'home-open-theme');
    await expectIdText(ctx, 'theme-demo-scheme', 'Light', 15_000);
    await tapId(ctx, 'theme-demo-toggle');
    await expectIdText(ctx, 'theme-demo-scheme', 'Dark');
    await expectId(ctx, 'theme-demo-top-fade');
    await tapId(ctx, 'theme-demo-toggle');
    await expectIdText(ctx, 'theme-demo-scheme', 'Light');
});
