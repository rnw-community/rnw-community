import { useEffect, useState } from 'react';
import {
    scrollTo,
    useAnimatedReaction,
    useAnimatedRef,
    useAnimatedScrollHandler,
    useFrameCallback,
    useSharedValue,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import type Animated from 'react-native-reanimated';

const SCROLLED_OFFSET = 200;
const TEMPORAL_SCROLL_START = 0;
const TEMPORAL_SCROLL_END = 200;
const TEMPORAL_SCROLL_FRAMES = 300;
const TEMPORAL_SCROLL_STEP = (TEMPORAL_SCROLL_END - TEMPORAL_SCROLL_START) / TEMPORAL_SCROLL_FRAMES;

export const useEdgeFadeScroll = (state: string, isScrolledState: boolean) => {
    const [temporalPrepared, setTemporalPrepared] = useState(false);
    const [temporalDone, setTemporalDone] = useState(false);
    const scrollRef = useAnimatedRef<Animated.ScrollView>();
    const scrollY = useSharedValue(0);
    const temporalScrollY = useSharedValue(0);
    const temporalScrollActive = useSharedValue(false);
    const onScroll = useAnimatedScrollHandler({
        onScroll: event => {
            scrollY.set(event.contentOffset.y);
        },
    });

    useFrameCallback(() => {
        'worklet';
        if (!temporalScrollActive.get()) {
            return;
        }

        const offset = Math.min(temporalScrollY.get() + TEMPORAL_SCROLL_STEP, TEMPORAL_SCROLL_END);

        temporalScrollY.set(offset);

        if (offset >= TEMPORAL_SCROLL_END) {
            temporalScrollActive.set(false);
            scheduleOnRN(setTemporalDone, true);
        }
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
        const offset = temporalPrepared || !isScrolledState ? TEMPORAL_SCROLL_START : SCROLLED_OFFSET;

        temporalScrollY.set(offset);
        scrollRef.current?.scrollTo({ y: offset, animated: false });
    }, [state, isScrolledState, scrollRef, temporalPrepared, temporalScrollActive, temporalScrollY]);

    const resetTemporalScroll = () => {
        setTemporalPrepared(false);
        setTemporalDone(false);
        temporalScrollActive.set(false);
        temporalScrollY.set(0);
    };

    const prepareTemporalScroll = () => {
        setTemporalPrepared(true);
        setTemporalDone(false);
        temporalScrollActive.set(false);
        temporalScrollY.set(TEMPORAL_SCROLL_START);
        scrollRef.current?.scrollTo({ y: TEMPORAL_SCROLL_START, animated: false });
    };

    const startTemporalScroll = () => {
        temporalScrollY.set(TEMPORAL_SCROLL_START);
        temporalScrollActive.set(true);
    };

    return {
        scrollRef,
        scrollY,
        onScroll,
        temporalPrepared,
        temporalDone,
        resetTemporalScroll,
        prepareTemporalScroll,
        startTemporalScroll,
    };
};
