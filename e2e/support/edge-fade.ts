import { captureScreen, expectId, keep, sleep, stopRecording, tapId, type Ctx } from './core.ts';
import { openDemo } from './screen-chrome.ts';

export const SCHEMES = ['dark', 'light'] as const;
export const BACKGROUNDS = ['dark', 'light', 'vivid'] as const;

/** Opens the edge-fade harness screen. */
export const openHarness = (ctx: Ctx, readyId: string): Promise<void> => openDemo(ctx, 'edge-fade', readyId);

/** Maestro's `waitForAnimationToEnd` before a capture: the blur and wash settle after the tree already has. */
const settle = (): Promise<void> => sleep(1_000);

/** `takeScreenshot: edge-fade/<name>`. */
export async function capture(ctx: Ctx, name: string): Promise<void> {
    await settle();
    await captureScreen(ctx, `edge-fade/${name}`);
}

/** `startRecording: temporal-<cell>` around one programmatic scroll traversal, prepared at offset 200 first. */
export async function recordTraversal(ctx: Ctx, cell: string): Promise<void> {
    await tapId(ctx, 'edge-fade-harness-temporal-prepare');
    await expectId(ctx, 'edge-fade-harness-temporal-witness', 5_000);
    await settle();
    await ctx.app.startRecording({ name: `temporal-${cell}` });
    await tapId(ctx, 'edge-fade-harness-temporal');
    await expectId(ctx, 'edge-fade-harness-temporal-done', 30_000);
    await keep(await stopRecording(ctx), `edge-fade/temporal/temporal-${cell}`);
}
