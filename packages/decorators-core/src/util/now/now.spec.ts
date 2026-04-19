import { describe, expect, it } from '@jest/globals';

import { now } from './now';

describe('now', () => {
    it('returns a finite non-negative number', () => {
        const t = now();
        expect(typeof t).toBe('number');
        expect(Number.isFinite(t)).toBe(true);
        expect(t).toBeGreaterThanOrEqual(0);
    });

    it('is monotonically non-decreasing on successive calls', () => {
        const a = now();
        const b = now();
        expect(b).toBeGreaterThanOrEqual(a);
    });
});
