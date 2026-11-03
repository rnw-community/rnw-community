import { expect } from 'e2e';

import { byId, containingText, expectId, expectIdText, launch, phase, scrollTo, tapId, type Ctx } from './core.ts';

/** Android's optional `OK` alert (`tapOn: text: OK, optional: true`). */
async function acceptAndroidAlert(ctx: Ctx): Promise<void> {
    const ok = ctx.screen.getByText('OK').last();
    if (ctx.platform === 'android' && (await ok.isVisible())) {
        await ok.tap();
    }
}

/** subflows/launch_and_wait_for_probe */
export async function launchAndWaitForProbe(ctx: Ctx): Promise<void> {
    await launch(ctx, async () => {
        await acceptAndroidAlert(ctx);
        await expect(byId(ctx, 'payments-flow-state')).toBeVisible({ timeout: 60_000 });
    });
    await phase('wait for probe', async () => {
        await expectIdText(ctx, 'payments-flow-state', 'idle', 60_000);
        await expectId(ctx, 'action-show');
        await expect(byId(ctx, 'payments-can-make-status')).not.toHaveText('checking', { timeout: 15_000 });
    });
}

/** subflows/show_request */
export async function showRequest(ctx: Ctx): Promise<void> {
    await phase('show request', async () => {
        await scrollTo(ctx, byId(ctx, 'action-show'), 'up');
        await tapId(ctx, 'action-show');
        await acceptAndroidAlert(ctx);
    });
}

/** subflows/dismiss_ios_sheet: the PassKit sheet's own `dismiss` button; its first presentation has taken over a minute. */
export async function dismissIosSheet(ctx: Ctx): Promise<void> {
    if (ctx.platform !== 'ios') {
        return;
    }
    await phase('dismiss sheet', async () => {
        await expectId(ctx, 'dismiss', 120_000);
        await tapId(ctx, 'dismiss');
        await expectIdText(ctx, 'payments-flow-state', 'rejected', 45_000);
    });
}

/** `scrollUntilVisible: text: .*<text>.*`, then `assertVisible` on the same text. */
export async function expectLog(ctx: Ctx, text: string): Promise<void> {
    await scrollTo(ctx, containingText(ctx, text));
    await expect(containingText(ctx, text)).toBeVisible();
}

/** Scrolls the flow state back into view and waits for `rejected`. */
export async function expectRejected(ctx: Ctx): Promise<void> {
    await scrollTo(ctx, byId(ctx, 'payments-flow-state'), 'up');
    await expectIdText(ctx, 'payments-flow-state', 'rejected', 45_000);
}
