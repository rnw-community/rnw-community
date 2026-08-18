import { describe, expect, it } from '@jest/globals';

import { getCollapsibleHeaderSnapOffset } from './get-collapsible-header-snap-offset';

const SNAP_CONFIG = { snapStart: 20, snapEnd: 100 };

describe('getCollapsibleHeaderSnapOffset', () => {
    it.each([
        { name: 'missing snap config', offsetY: 60, snapConfig: null, expected: null },
        { name: 'offset at the start endpoint', offsetY: 20, snapConfig: SNAP_CONFIG, expected: null },
        { name: 'offset before the start endpoint', offsetY: 0, snapConfig: SNAP_CONFIG, expected: null },
        { name: 'offset at the end endpoint', offsetY: 100, snapConfig: SNAP_CONFIG, expected: null },
        { name: 'offset beyond the end endpoint', offsetY: 150, snapConfig: SNAP_CONFIG, expected: null },
        { name: 'offset below the midpoint', offsetY: 59, snapConfig: SNAP_CONFIG, expected: 20 },
        { name: 'offset at the midpoint', offsetY: 60, snapConfig: SNAP_CONFIG, expected: 100 },
        { name: 'offset above the midpoint', offsetY: 61, snapConfig: SNAP_CONFIG, expected: 100 },
    ])('returns $expected for $name', ({ offsetY, snapConfig, expected }) => {
        expect.hasAssertions();

        expect(getCollapsibleHeaderSnapOffset(offsetY, snapConfig)).toBe(expected);
    });
});
