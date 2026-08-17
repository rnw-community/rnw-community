import { scrollTo } from 'react-native-reanimated';

import { getCollapsibleHeaderSnapOffset } from '../get-collapsible-header-snap-offset/get-collapsible-header-snap-offset';

import type { CollapsibleHeaderSnapConfig } from '../../interface/collapsible-header-snap-config.interface';
import type { Maybe } from '@rnw-community/shared';
import type { NativeScrollEvent } from 'react-native';
import type Animated from 'react-native-reanimated';
import type { AnimatedRef, SharedValue } from 'react-native-reanimated';

const SNAP_SETTLE_FRAME_COUNT = 3;

export const createCollapsibleHeaderScrollWorklets = (
    scrollY: SharedValue<number>,
    scrollRef: AnimatedRef<Animated.ScrollView>,
    snapConfig: SharedValue<Maybe<CollapsibleHeaderSnapConfig>>,
    snapSettleGeneration: SharedValue<number>
) => {
    const snapToNearestEndpoint = (offsetY: number): void => {
        'worklet';

        const snapOffset = getCollapsibleHeaderSnapOffset(offsetY, snapConfig.get());
        if (snapOffset !== null) {
            scrollTo(scrollRef, 0, snapOffset, true);
        }
    };

    const watchForSettledScroll = (generation: number, releaseOffsetY: number): void => {
        'worklet';

        let settledOffsetY = releaseOffsetY;
        let stableFrameCount = 0;
        const checkFrame = (): void => {
            if (snapSettleGeneration.get() !== generation) {
                return;
            }
            if (scrollY.get() !== settledOffsetY) {
                settledOffsetY = scrollY.get();
                stableFrameCount = 0;
                requestAnimationFrame(checkFrame);

                return;
            }
            stableFrameCount += 1;
            if (stableFrameCount < SNAP_SETTLE_FRAME_COUNT) {
                requestAnimationFrame(checkFrame);

                return;
            }
            snapToNearestEndpoint(settledOffsetY);
        };
        requestAnimationFrame(checkFrame);
    };

    return {
        onScroll: (event: NativeScrollEvent): void => {
            'worklet';

            scrollY.set(event.contentOffset.y);
        },
        onBeginDrag: (): void => {
            'worklet';

            snapSettleGeneration.set(snapSettleGeneration.get() + 1);
        },
        onEndDrag: (event: NativeScrollEvent): void => {
            'worklet';

            const generation = snapSettleGeneration.get() + 1;
            snapSettleGeneration.set(generation);
            watchForSettledScroll(generation, event.contentOffset.y);
        },
    };
};
