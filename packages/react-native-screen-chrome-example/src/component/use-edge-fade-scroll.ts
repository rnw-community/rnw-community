import { useEffect, useState } from 'react';
import {
    scrollTo,
    useAnimatedReaction,
    useAnimatedRef,
    useAnimatedScrollHandler,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated';

import type Animated from 'react-native-reanimated';

const SCROLLED_OFFSET = 200;
const TEMPORAL_SCROLL_START = 200;
const TEMPORAL_SCROLL_END = 400;
const TEMPORAL_SCROLL_DURATION = 5000;

export const useEdgeFadeScroll = (state: string, isScrolledState: boolean) => {
    const [temporalPrepared, setTemporalPrepared] = useState(false);
    const scrollRef = useAnimatedRef<Animated.ScrollView>();
    const scrollY = useSharedValue(0);
    const temporalScrollY = useSharedValue(0);
    const temporalScrollActive = useSharedValue(false);
    const onScroll = useAnimatedScrollHandler({
        onScroll: event => {
            scrollY.set(event.contentOffset.y);
        },
    });

    useAnimatedReaction(
        () => (temporalScrollActive.get() ? temporalScrollY.get() : -1),
        offset => {
            if (offset >= 0) {
                scrollTo(scrollRef, 0, offset, false);
            }
        }
    );

    useEffect(() => {
        temporalScrollActive.set(false);
        const offset = isScrolledState ? SCROLLED_OFFSET : 0;

        temporalScrollY.set(offset);
        scrollRef.current?.scrollTo({ y: offset, animated: false });
    }, [state, isScrolledState, scrollRef, temporalScrollActive, temporalScrollY]);

    const resetTemporalScroll = () => {
        setTemporalPrepared(false);
        temporalScrollActive.set(false);
        temporalScrollY.set(0);
    };

    const prepareTemporalScroll = () => {
        setTemporalPrepared(true);
        temporalScrollActive.set(false);
        temporalScrollY.set(TEMPORAL_SCROLL_START);
        scrollRef.current?.scrollTo({ y: TEMPORAL_SCROLL_START, animated: false });
    };

    const startTemporalScroll = () => {
        temporalScrollY.set(TEMPORAL_SCROLL_START);
        temporalScrollActive.set(true);
        temporalScrollY.set(withTiming(TEMPORAL_SCROLL_END, { duration: TEMPORAL_SCROLL_DURATION }));
    };

    return {
        scrollRef,
        scrollY,
        onScroll,
        temporalPrepared,
        resetTemporalScroll,
        prepareTemporalScroll,
        startTemporalScroll,
    };
};
