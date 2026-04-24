import { describe, expect, it } from '@jest/globals';

import { wait } from './wait';

describe('wait', () => {
    it('resolves to undefined', async () => {
        expect.hasAssertions();

        await expect(wait(0)).resolves.toBeUndefined();
    });

    it('resolves with 0 ms without throwing', async () => {
        expect.hasAssertions();

        await expect(wait(0)).resolves.toBeUndefined();
    });

    it('resolves after at least the requested delay', async () => {
        expect.hasAssertions();

        const ms = 20;
        const before = Date.now();
        await wait(ms);
        const elapsed = Date.now() - before;

        expect(elapsed).toBeGreaterThanOrEqual(ms - 5);
    });
});
