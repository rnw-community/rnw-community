import { keep, stopRecording, type Ctx } from './core.ts';

/**
 * Records `gestures` into `.e2e/recording/<docsPath>.mp4`. `docsPath` is where the GIF lives under `packages/`,
 * which is where docs-media.yml's conversion writes it.
 */
export async function recordClip(ctx: Ctx, docsPath: string, gestures: () => Promise<void>): Promise<void> {
    await ctx.app.startRecording({ name: docsPath.replaceAll('/', '-') });
    await gestures();
    await keep(await stopRecording(ctx), `recording/${docsPath}`);
}

/** The `android-pixel` target's screen, in the physical pixels agent-device swipes in. */
export const onPixel = (ctx: Ctx): Ctx => ({ ...ctx, viewport: { width: 1080, height: 2400 } });
