import { expectId, launch, phase, swipePercent, type Ctx } from './core.ts';

/** subflows/launch_header_demo: a cold release build on a shared host has taken ~13 s to its first frame. */
export const launchHeaderDemo = (ctx: Ctx): Promise<void> =>
    launch(ctx, () => expectId(ctx, 'header-demo-expanded-amount', 60_000));

/**
 * subflows/collapse_header: two slow full drags reach the collapsed endpoint unambiguously (a short scroll would
 * snap back to expanded), and slow enough to be a scroll position rather than a fling.
 */
export async function collapseHeader(ctx: Ctx, collapsedId: string): Promise<void> {
    await phase('collapse header', async () => {
        for (let swipe = 0; swipe < 2; swipe++) {
            await swipePercent(ctx, [50, 80], [50, 30], 900);
        }
        await expectId(ctx, collapsedId, 15_000);
    });
}
