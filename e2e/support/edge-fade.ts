import { captureScreen, expectId, keep, sleep, stopRecording, tapId, type Ctx } from './core.ts';
import { openDemo } from './screen-chrome.ts';

/** Opens the edge-fade harness screen. */
export const openHarness = (ctx: Ctx, readyId: string): Promise<void> => openDemo(ctx, 'edge-fade', readyId);

/** Before a capture: the blur and wash settle after the tree already has. */
const settle = (): Promise<void> => sleep(1_000);

/** A settled screenshot at `edge-fade/<name>`. */
export async function capture(ctx: Ctx, name: string): Promise<void> {
    await settle();
    await captureScreen(ctx, `edge-fade/${name}`);
}

/**
 * The traversal scrolls 300 frames, 5 s at 60 Hz. Waiting that out before looking for its end keeps accessibility-tree
 * reads off the device while it records: a snapshot polled during a recording has come back as an invalid daemon
 * response from the farm (rnw-community/mobile-ci#319).
 */
const TRAVERSAL_MS = 5_000;

/** Records `temporal-<cell>` around one programmatic scroll traversal, prepared at offset 200 first. */
export async function recordTraversal(ctx: Ctx, cell: string): Promise<void> {
    await tapId(ctx, 'edge-fade-harness-temporal-prepare');
    await expectId(ctx, 'edge-fade-harness-temporal-witness', 5_000);
    await settle();
    await ctx.app.startRecording({ name: `temporal-${cell}` });
    await tapId(ctx, 'edge-fade-harness-temporal');
    await sleep(TRAVERSAL_MS);
    await expectId(ctx, 'edge-fade-harness-temporal-done', 30_000);
    await keep(await stopRecording(ctx), `edge-fade/temporal/temporal-${cell}`);
}
