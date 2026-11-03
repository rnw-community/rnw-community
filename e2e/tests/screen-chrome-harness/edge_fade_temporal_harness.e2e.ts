import { phase, tapId } from '../../support/core.ts';
import { BACKGROUNDS, SCHEMES, openHarness, recordTraversal } from '../../support/edge-fade.ts';
import { test } from '../../support/test.ts';

test('edge fade temporal harness', async ({ ctx }) => {
    await openHarness(ctx, 'edge-fade-harness-temporal-prepare');
    for (const [schemeIndex, scheme] of SCHEMES.entries()) {
        if (schemeIndex > 0) {
            await tapId(ctx, 'edge-fade-harness-scheme');
        }
        for (const [backgroundIndex, background] of BACKGROUNDS.entries()) {
            if (schemeIndex + backgroundIndex > 0) {
                await tapId(ctx, 'edge-fade-harness-background');
            }
            await phase(`${scheme}-${background}`, () => recordTraversal(ctx, `${scheme}-${background}`));
        }
    }
});
