import { scrollTo } from 'react-native-reanimated';

import { getCollapsibleHeaderSnapOffset } from '../get-collapsible-header-snap-offset/get-collapsible-header-snap-offset';

import type { CollapsibleHeaderScrollWorkletsConfig } from '../../interface/collapsible-header-scroll-worklets-config.interface';
import type { NativeScrollEvent } from 'react-native';

const SNAP_SETTLE_FRAME_COUNT = 3;

export const createCollapsibleHeaderScrollWorklets = ({
    scrollY,
    scrollRef,
    snapConfig,
    snapSettleGeneration,
    snapAnimated,
}: CollapsibleHeaderScrollWorkletsConfig) => {
    const snapToNearestEndpoint = (offsetY: number): void => {
        'worklet';

        const snapOffset = getCollapsibleHeaderSnapOffset(offsetY, snapConfig.get());
        if (snapOffset !== null) {
            scrollTo(scrollRef, 0, snapOffset, snapAnimated);
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
