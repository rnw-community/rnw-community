import { test as base } from '@e2e-dev/mobile';

import type { Ctx } from './core.ts';
import type { Platform } from './devices.ts';

/** The suite's `test`: every test gets `ctx`, the context every helper takes. */
export const test = base.extend<{ ctx: Ctx }>({
    ctx: async ({ screen, app, device, platform }, use) => {
        await use({ screen, app, device, platform: platform as Platform });
    },
});
