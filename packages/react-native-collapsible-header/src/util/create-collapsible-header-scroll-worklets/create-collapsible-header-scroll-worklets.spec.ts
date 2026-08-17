import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
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

type FrameCallback = (time: number) => void;

const SNAP_CONFIG: CollapsibleHeaderSnapConfig = { snapStart: 20, snapEnd: 100 };
const SCROLL_REF = {} as AnimatedRef<Animated.ScrollView>;
const SETTLE_FRAME_COUNT = 3;
const BELOW_MIDPOINT_OFFSET = 40;
const MID_FLING_OFFSET = 70;
const ABOVE_MIDPOINT_OFFSET = 90;

const buildScrollEvent = (offsetY: number): NativeScrollEvent =>
    ({ contentOffset: { x: 0, y: offsetY } }) as NativeScrollEvent;

let pendingFrames: FrameCallback[] = [];

const runFrame = (): void => {
    const frames = pendingFrames;
    pendingFrames = [];
    frames.forEach(frame => void frame(0));
};

const runFrames = (count: number): void => {
    Array.from({ length: count }).forEach(() => void runFrame());
};

const buildSubject = (snapConfigValue: Maybe<CollapsibleHeaderSnapConfig>) => {
    const scrollY = makeMutable(0);
    const snapConfig = makeMutable<Maybe<CollapsibleHeaderSnapConfig>>(snapConfigValue);
    const snapSettleGeneration = makeMutable(0);
    jest.mocked(scrollTo).mockClear();

    return {
        scrollY,
        snapSettleGeneration,
        worklets: createCollapsibleHeaderScrollWorklets(scrollY, SCROLL_REF, snapConfig, snapSettleGeneration),
    };
};

describe('createCollapsibleHeaderScrollWorklets', () => {
    beforeEach(() => {
        pendingFrames = [];
        jest.spyOn(globalThis, 'requestAnimationFrame').mockImplementation(frame => pendingFrames.push(frame));
    });

    afterEach(() => void jest.restoreAllMocks());

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
    ])('skips snapping $name once the released scroll settles', ({ snapConfig, offsetY }) => {
        expect.hasAssertions();
        const { scrollY, worklets } = buildSubject(snapConfig);

        scrollY.set(offsetY);
        worklets.onEndDrag(buildScrollEvent(offsetY));
        runFrames(SETTLE_FRAME_COUNT);

        expect(jest.mocked(scrollTo)).not.toHaveBeenCalled();
        expect(pendingFrames).toHaveLength(0);
    });

    it.each([
        { name: 'back below the midpoint', offsetY: 40, snapped: 20 },
        { name: 'forward above the midpoint', offsetY: 90, snapped: 100 },
    ])('snaps $name once the released scroll settles', ({ offsetY, snapped }) => {
        expect.hasAssertions();
        const { scrollY, worklets } = buildSubject(SNAP_CONFIG);

        scrollY.set(offsetY);
        worklets.onEndDrag(buildScrollEvent(offsetY));
        runFrames(SETTLE_FRAME_COUNT - 1);

        expect(jest.mocked(scrollTo)).not.toHaveBeenCalled();

        runFrame();

        expect(jest.mocked(scrollTo)).toHaveBeenCalledWith(SCROLL_REF, 0, snapped, true);
    });

    it('snaps from the settled offset instead of the release offset after a fling', () => {
        expect.hasAssertions();
        const { scrollY, worklets } = buildSubject(SNAP_CONFIG);

        scrollY.set(BELOW_MIDPOINT_OFFSET);
        worklets.onEndDrag(buildScrollEvent(BELOW_MIDPOINT_OFFSET));
        runFrame();
        worklets.onScroll(buildScrollEvent(MID_FLING_OFFSET));
        runFrame();
        worklets.onScroll(buildScrollEvent(ABOVE_MIDPOINT_OFFSET));
        runFrames(SETTLE_FRAME_COUNT + 1);

        expect(jest.mocked(scrollTo)).toHaveBeenCalledTimes(1);
        expect(jest.mocked(scrollTo)).toHaveBeenCalledWith(SCROLL_REF, 0, 100, true);
    });

    it('abandons a pending snap when a new drag begins', () => {
        expect.hasAssertions();
        const { scrollY, worklets } = buildSubject(SNAP_CONFIG);

        scrollY.set(BELOW_MIDPOINT_OFFSET);
        worklets.onEndDrag(buildScrollEvent(BELOW_MIDPOINT_OFFSET));
        worklets.onBeginDrag();
        runFrames(SETTLE_FRAME_COUNT);

        expect(jest.mocked(scrollTo)).not.toHaveBeenCalled();
        expect(pendingFrames).toHaveLength(0);
    });

    it('keeps only the latest watch when a drag ends again before settling', () => {
        expect.hasAssertions();
        const { scrollY, worklets } = buildSubject(SNAP_CONFIG);

        scrollY.set(BELOW_MIDPOINT_OFFSET);
        worklets.onEndDrag(buildScrollEvent(BELOW_MIDPOINT_OFFSET));
        runFrame();
        worklets.onBeginDrag();
        scrollY.set(ABOVE_MIDPOINT_OFFSET);
        worklets.onEndDrag(buildScrollEvent(ABOVE_MIDPOINT_OFFSET));
        runFrames(SETTLE_FRAME_COUNT + 1);

        expect(jest.mocked(scrollTo)).toHaveBeenCalledTimes(1);
        expect(jest.mocked(scrollTo)).toHaveBeenCalledWith(SCROLL_REF, 0, 100, true);
    });
});
