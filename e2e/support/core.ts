import { copyFile, mkdir } from 'node:fs/promises';
import { dirname, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { byId as firstById, retry, scrollTo as scrollUntilVisible, tapUntil as tapUntilGone } from '@mobile-ci/e2e-simlock/steps';
import { expect } from 'e2e';

import { DEVICES, type Platform } from './devices.ts';

import type { Device } from '@e2e-dev/mobile';
import type { App, Locator, Screen } from 'e2e';

/** What every helper takes: the test's own fixtures. */
export interface Ctx {
    readonly screen: Screen;
    readonly app: App;
    readonly device: Device;
    readonly platform: Platform;
    /** The leased screen, where the target's model is not `DEVICES[platform]`'s. */
    readonly viewport?: { readonly width: number; readonly height: number };
}

export const sleep = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));

/** A React Native testID shows up on the host view and its wrapper: take the first. */
export const byId = (ctx: Ctx, testId: string): Locator => firstById(ctx.screen, testId);

/** The first element whose text contains `text`. */
export const containingText = (ctx: Ctx, text: string): Locator =>
    ctx.screen.getByText(new RegExp(text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))).first();

/** Times a named phase; the timings land in the run log. */
export async function phase<T>(name: string, body: () => Promise<T>): Promise<T> {
    const started = Date.now();
    try {
        return await body();
    } finally {
        console.log(`[phase] ${name} ${((Date.now() - started) / 1000).toFixed(1)}s`);
    }
}

export const tapId = (ctx: Ctx, testId: string): Promise<void> => byId(ctx, testId).tap();

export const expectId = (ctx: Ctx, testId: string, timeout?: number): Promise<void> =>
    expect(byId(ctx, testId)).toBeVisible(timeout === undefined ? undefined : { timeout });

export const expectNoId = (ctx: Ctx, testId: string, timeout?: number): Promise<void> =>
    expect(byId(ctx, testId)).toBeHidden(timeout === undefined ? undefined : { timeout });

/** The element is visible and shows exactly `text`. */
export async function expectIdText(ctx: Ctx, testId: string, text: string | RegExp, timeout?: number): Promise<void> {
    const options = timeout === undefined ? undefined : { timeout };
    await expect(byId(ctx, testId)).toBeVisible(options);
    await expect(byId(ctx, testId)).toHaveText(text, options);
}

/** Scrolls until `target` shows (`direction` is where the content goes: `down` reveals what is below). */
export const scrollTo = (ctx: Ctx, target: Locator, direction: 'up' | 'down' = 'down'): Promise<void> =>
    scrollUntilVisible(ctx.screen, target, direction);

/** A tap that navigates: tap again while the tapped element still shows and the next state does not. */
export const tapUntil = (ctx: Ctx, testId: string, next: () => Promise<void>, attempts = 3): Promise<void> =>
    tapUntilGone(byId(ctx, testId), next, { attempts });

type Percent = readonly [x: number, y: number];

/** A swipe between two points given as percentages of the leased device's screen. */
export async function swipePercent(ctx: Ctx, from: Percent, to: Percent, duration?: number): Promise<void> {
    const { width, height } = ctx.viewport ?? DEVICES[ctx.platform].viewport;
    const point = ([x, y]: Percent) => ({ x: Math.round((width * x) / 100), y: Math.round((height * y) / 100) });
    await ctx.screen.swipe({ from: point(from), to: point(to), ...(duration === undefined ? {} : { duration }) });
}

/**
 * A fresh launch of an app that persists nothing, retried because Android can kill a relaunched process while it
 * removes the previous task.
 */
export async function launch(ctx: Ctx, firstFrame: () => Promise<void>): Promise<void> {
    await phase('launch', async () => {
        await retry(2, async () => {
            await ctx.app.open();
            await firstFrame();
        });
    });
}

/**
 * A drag released between a collapsible header's snap midpoint and its end, so the snap has work to do. Android's
 * injected swipe ends without a fling (offset = travel / 2); iOS's carries momentum past the midpoint, so it is shorter.
 */
export const snapDrag = (ctx: Ctx): Promise<void> =>
    ctx.platform === 'android' ? swipePercent(ctx, [50, 75], [50, 37], 900) : swipePercent(ctx, [50, 70], [50, 55]);

/**
 * Copies a capture to `.e2e/<name>.<ext>`, so it ships in the run's e2e artifact at a path its consumers read
 * (the edge-fade metrics, the docs media conversion).
 */
export async function keep(source: string, name: string): Promise<void> {
    const target = fileURLToPath(new URL(`../.e2e/${name}${extname(source)}`, import.meta.url));
    await mkdir(dirname(target), { recursive: true });
    await copyFile(source, target);
}

/**
 * A screenshot in `.e2e/<name>.png`: the device's own pixels, unmasked and unscaled, where
 * `app.screenshot` writes a point-scale evidence image (iOS stills come from the XCTest runner, see the relay).
 */
export async function captureScreen(ctx: Ctx, name: string): Promise<void> {
    const path = fileURLToPath(new URL(`../.e2e/${name}.png`, import.meta.url));
    await mkdir(dirname(path), { recursive: true });
    await ctx.device.unstable_raw.client.capture.screenshot({ path });
}

/** Stops the recording and returns its local file. */
export async function stopRecording(ctx: Ctx): Promise<string> {
    const [video] = await ctx.app.stopRecording();
    if (!('path' in video)) {
        throw new Error(`the recording is kept remotely (${video.url}), not as a file`);
    }
    return video.path;
}
