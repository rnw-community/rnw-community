import { describe, expect, it, jest } from '@jest/globals';
import { makeMutable, scrollTo } from 'react-native-reanimated';

import { createCollapsibleHeaderScrollWorklets } from './create-collapsible-header-scroll-worklets';

import type { CollapsibleHeaderSnapConfig } from '../../interface/collapsible-header-snap-config.interface';
import type { Maybe } from '@rnw-community/shared';
import type { NativeScrollEvent } from 'react-native';
import type Animated from 'react-native-reanimated';
import type { AnimatedRef } from 'react-native-reanimated';

jest.mock('react-native-reanimated', () => ({
    ...jest.requireActual<Record<string, unknown>>('react-native-reanimated'),
    scrollTo: jest.fn(),
}));

const SNAP_CONFIG: CollapsibleHeaderSnapConfig = { snapStart: 20, snapEnd: 100 };
const SCROLL_REF = {} as AnimatedRef<Animated.ScrollView>;

const buildScrollEvent = (offsetY: number, velocityY?: number): NativeScrollEvent =>
    ({
        contentOffset: { x: 0, y: offsetY },
        ...(velocityY === undefined ? {} : { velocity: { x: 0, y: velocityY } }),
    }) as NativeScrollEvent;

const buildSubject = (snapConfigValue: Maybe<CollapsibleHeaderSnapConfig>) => {
    const scrollY = makeMutable(0);
    const snapConfig = makeMutable<Maybe<CollapsibleHeaderSnapConfig>>(snapConfigValue);
    jest.mocked(scrollTo).mockClear();

    return { scrollY, worklets: createCollapsibleHeaderScrollWorklets(scrollY, SCROLL_REF, snapConfig) };
};

describe('createCollapsibleHeaderScrollWorklets', () => {
    it('tracks the scroll offset', () => {
        expect.hasAssertions();
        const { scrollY, worklets } = buildSubject(null);

        worklets.onScroll(buildScrollEvent(42));

        expect(scrollY.get()).toBe(42);
        expect(jest.mocked(scrollTo)).not.toHaveBeenCalled();
    });

    it.each([
        { name: 'without snap geometry', snapConfig: null, offsetY: 60 },
        { name: 'at the start endpoint', snapConfig: SNAP_CONFIG, offsetY: 20 },
        { name: 'beyond the end endpoint', snapConfig: SNAP_CONFIG, offsetY: 130 },
    ])('skips snapping $name when momentum ends', ({ snapConfig, offsetY }) => {
        expect.hasAssertions();
        const { worklets } = buildSubject(snapConfig);

        worklets.onMomentumEnd(buildScrollEvent(offsetY));

        expect(jest.mocked(scrollTo)).not.toHaveBeenCalled();
    });

    it.each([
        { name: 'back below the midpoint', offsetY: 40, snapped: 20 },
        { name: 'forward above the midpoint', offsetY: 90, snapped: 100 },
    ])('snaps $name when momentum ends', ({ offsetY, snapped }) => {
        expect.hasAssertions();
        const { worklets } = buildSubject(SNAP_CONFIG);

        worklets.onMomentumEnd(buildScrollEvent(offsetY));

        expect(jest.mocked(scrollTo)).toHaveBeenCalledWith(SCROLL_REF, 0, snapped, true);
    });

    it('snaps after a settled drag', () => {
        expect.hasAssertions();
        const { worklets } = buildSubject(SNAP_CONFIG);

        worklets.onEndDrag(buildScrollEvent(40, 0));

        expect(jest.mocked(scrollTo)).toHaveBeenCalledWith(SCROLL_REF, 0, 20, true);
    });

    it('snaps after a drag without a velocity payload', () => {
        expect.hasAssertions();
        const { worklets } = buildSubject(SNAP_CONFIG);

        worklets.onEndDrag(buildScrollEvent(40));

        expect(jest.mocked(scrollTo)).toHaveBeenCalledWith(SCROLL_REF, 0, 20, true);
    });

    it('defers to momentum for a flung drag', () => {
        expect.hasAssertions();
        const { worklets } = buildSubject(SNAP_CONFIG);

        worklets.onEndDrag(buildScrollEvent(40, 0.5));

        expect(jest.mocked(scrollTo)).not.toHaveBeenCalled();
    });
});
