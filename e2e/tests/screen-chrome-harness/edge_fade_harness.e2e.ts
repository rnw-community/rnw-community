import { phase, tapId } from '../../support/core.ts';
import { BACKGROUNDS, SCHEMES, capture, openHarness } from '../../support/edge-fade.ts';
import { test } from '../../support/test.ts';

const STATES = ['reference', 'rest', 'scrolled', 'blur-only'] as const;

test('edge fade harness', async ({ ctx }) => {
    await openHarness(ctx, 'edge-fade-harness-state');
    for (const scheme of SCHEMES) {
        for (const background of BACKGROUNDS) {
            await phase(`${scheme}-${background}`, async () => {
                for (const [index, state] of STATES.entries()) {
                    if (index > 0) {
                        await tapId(ctx, 'edge-fade-harness-state');
                    }
                    await capture(ctx, `${scheme}-${background}-${state}`);
                }
                await tapId(ctx, 'edge-fade-harness-state');
                await tapId(ctx, 'edge-fade-harness-background');
            });
        }
        await tapId(ctx, 'edge-fade-harness-scheme');
    }
    await phase('compact-dark-dark', async () => {
        await tapId(ctx, 'edge-fade-harness-compact');
        await capture(ctx, 'compact-dark-dark-reference');
        await tapId(ctx, 'edge-fade-harness-state');
        await tapId(ctx, 'edge-fade-harness-state');
        await capture(ctx, 'compact-dark-dark-scrolled');
        await tapId(ctx, 'edge-fade-harness-state');
        await capture(ctx, 'compact-dark-dark-blur-only');
    });
});
