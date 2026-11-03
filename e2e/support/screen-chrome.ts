import { byId, expectId, launch, phase, swipePercent, tapId, type Ctx } from './core.ts';

/** subflows/launch_home: the demo picker's first frame. */
export async function launchHome(ctx: Ctx): Promise<void> {
    await launch(ctx, () => expectId(ctx, 'home-open-collapsible', 60_000));
    await expectId(ctx, 'home-open-static-header');
    await expectId(ctx, 'home-open-footer');
}

/** Opens a demo from the picker and waits for its first frame. */
export async function openDemo(ctx: Ctx, entry: string, readyId: string): Promise<void> {
    await launchHome(ctx);
    await tapId(ctx, `home-open-${entry}`);
    await expectId(ctx, readyId, 15_000);
}

/**
 * subflows/collapse_then_expand: two slow full drags collapse the `header` demo header; slow drags carry no fling,
 * so one drag back cannot undo two: keep dragging back (at most four times) until the expanded title returns.
 */
export async function collapseThenExpand(ctx: Ctx, header: string): Promise<void> {
    await phase('collapse', async () => {
        for (let swipe = 0; swipe < 2; swipe++) {
            await swipePercent(ctx, [50, 80], [50, 30], 900);
        }
        await expectId(ctx, `${header}-collapsed-title`, 15_000);
    });
    await phase('expand', async () => {
        for (let swipe = 0; swipe < 4 && !(await byId(ctx, `${header}-expanded-title`).isVisible()); swipe++) {
            await swipePercent(ctx, [50, 30], [50, 85], 900);
        }
        await expectId(ctx, `${header}-expanded-title`, 15_000);
    });
}
