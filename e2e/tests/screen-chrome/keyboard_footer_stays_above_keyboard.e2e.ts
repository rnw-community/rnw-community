import { byId, expectIdText, tapId } from '../../support/core.ts';
import { openDemo } from '../../support/screen-chrome.ts';
import { test } from '../../support/test.ts';

test('screen chrome keyboard footer stays above the keyboard', async ({ ctx }) => {
    await openDemo(ctx, 'keyboard', 'keyboard-demo-input');
    await byId(ctx, 'keyboard-demo-input').fill('hello');
    await tapId(ctx, 'keyboard-demo-send');
    await expectIdText(ctx, 'keyboard-demo-last-sent', 'Sent: hello', 15_000);
});
