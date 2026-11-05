import { sleep, swipePercent } from '../../support/core.ts';
import { recordClip } from '../../support/media.ts';
import { openDemo } from '../../support/screen-chrome.ts';
import { test } from '../../support/test.ts';

test('screen chrome example collapsible header clip', async ({ ctx }) => {
    await openDemo(ctx, 'collapsible', 'collapsible-demo-expanded-title');
    await recordClip(ctx, 'react-native-screen-chrome-example/docs/collapsible-header', async () => {
        await swipePercent(ctx, [50, 80], [50, 30], 900);
        await swipePercent(ctx, [50, 80], [50, 30], 900);
        await sleep(2_000);
        await swipePercent(ctx, [50, 30], [50, 85], 900);
        await sleep(2_000);
    });
});
