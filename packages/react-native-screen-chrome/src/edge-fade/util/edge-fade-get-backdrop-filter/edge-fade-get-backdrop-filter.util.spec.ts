import { describe, expect, it } from '@jest/globals';

import { getEdgeFadeBackdropFilter } from './edge-fade-get-backdrop-filter.util';

describe('getEdgeFadeBackdropFilter', () => {
    it('enforces the minimum web blur at low intensity', () => {
        expect.hasAssertions();

        expect(getEdgeFadeBackdropFilter(0)).toBe('blur(8px) saturate(1.08)');
    });

    it('scales the web blur for larger intensities', () => {
        expect.hasAssertions();

        expect(getEdgeFadeBackdropFilter(50)).toBe('blur(22.5px) saturate(1.08)');
    });
});
