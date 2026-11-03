import { phase, tapId } from '../../support/core.ts';
import { openHarness, recordTraversal } from '../../support/edge-fade.ts';
import { TEMPORAL_PLAN } from '../../support/edge-fade-plan.ts';
import { test } from '../../support/test.ts';

test('edge fade temporal harness', async ({ ctx }) => {
    await openHarness(ctx, 'edge-fade-harness-temporal-prepare');
    for (const step of TEMPORAL_PLAN) {
        for (const control of step.taps) {
            await tapId(ctx, control);
        }
        await phase(step.cell, () => recordTraversal(ctx, step.cell));
    }
});
