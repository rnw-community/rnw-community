import { scrollTo } from 'react-native-reanimated';

import { getCollapsibleHeaderSnapOffset } from '../get-collapsible-header-snap-offset/get-collapsible-header-snap-offset';

import type { CollapsibleHeaderSnapConfig } from '../../interface/collapsible-header-snap-config.interface';
import type { Maybe } from '@rnw-community/shared';
import type { NativeScrollEvent } from 'react-native';
import type Animated from 'react-native-reanimated';
import type { AnimatedRef, SharedValue } from 'react-native-reanimated';

const SNAP_DRAG_VELOCITY_EPSILON = 0.05;

export const createCollapsibleHeaderScrollWorklets = (
    scrollY: SharedValue<number>,
    scrollRef: AnimatedRef<Animated.ScrollView>,
    snapConfig: SharedValue<Maybe<CollapsibleHeaderSnapConfig>>
) => {
    const snapToNearestEndpoint = (offsetY: number): void => {
        'worklet';

        const snapOffset = getCollapsibleHeaderSnapOffset(offsetY, snapConfig.get());
        if (snapOffset !== null) {
            scrollTo(scrollRef, 0, snapOffset, true);
        }
    };

    return {
        onScroll: (event: NativeScrollEvent): void => {
            'worklet';

            scrollY.set(event.contentOffset.y);
        },
        onEndDrag: (event: NativeScrollEvent): void => {
            'worklet';

            if (Math.abs(event.velocity?.y ?? 0) <= SNAP_DRAG_VELOCITY_EPSILON) {
                snapToNearestEndpoint(event.contentOffset.y);
            }
        },
        onMomentumEnd: (event: NativeScrollEvent): void => {
            'worklet';

            snapToNearestEndpoint(event.contentOffset.y);
        },
    };
};
