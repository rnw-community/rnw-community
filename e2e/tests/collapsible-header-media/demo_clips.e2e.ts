import { expectId, swipePercent, tapId } from '../../support/core.ts';
import { launchHeaderDemo } from '../../support/collapsible-header.ts';
import { recordClip } from '../../support/media.ts';
import { test } from '../../support/test.ts';

const docs = (name: string): string => `react-native-collapsible-header/docs/${name}`;

test('collapsible header demo clip', async ({ ctx }) => {
    await launchHeaderDemo(ctx);
    await recordClip(ctx, docs('collapsible-header-demo'), async () => {
        await swipePercent(ctx, [50, 65], [50, 35], 900);
        await swipePercent(ctx, [50, 35], [50, 70], 900);
        await swipePercent(ctx, [50, 45], [50, 75], 700);
        await swipePercent(ctx, [50, 70], [50, 45], 1_200);
    });
});

test('collapsible header settings clip', async ({ ctx }) => {
    await launchHeaderDemo(ctx);
    await tapId(ctx, 'header-demo-settings-button');
    await expectId(ctx, 'settings-demo-large-title', 15_000);
    await recordClip(ctx, docs('settings-header-demo'), async () => {
        await swipePercent(ctx, [50, 60], [50, 38], 900);
        await swipePercent(ctx, [50, 38], [50, 65], 900);
        await swipePercent(ctx, [50, 60], [50, 45], 1_200);
    });
});
