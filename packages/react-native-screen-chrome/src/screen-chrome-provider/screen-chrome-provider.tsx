import React, { useCallback, useMemo } from 'react';
import {
    scrollTo,
    useAnimatedRef,
    useAnimatedScrollHandler,
    useReducedMotion,
    useScrollViewOffset,
} from 'react-native-reanimated';

import { MOMENTUM_VELOCITY_EPSILON } from '../constant/momentum-velocity-epsilon.constant.js';
import { ScreenChromeContext } from '../context/screen-chrome.context.js';
import { ColorSchemeEnum } from '../enum/color-scheme.enum.js';
import { assertValidScreenChromeConfig } from '../utils/assert-valid-screen-chrome-config.util.js';
import { mergeScreenChromeConfig } from '../utils/merge-screen-chrome-config.util.js';

import type { ScreenChromeConfigOverridesInterface } from '../interface/screen-chrome-config-overrides.interface.js';
import type { ReactNode } from 'react';
import type { ScrollView } from 'react-native';
import type { ScrollEvent, ScrollHandlers } from 'react-native-reanimated';

interface Props {
    readonly children: ReactNode;
    readonly colorScheme?: ColorSchemeEnum;
    readonly config?: ScreenChromeConfigOverridesInterface;
}

/**
 * Provides shared scroll state, resolved configuration, and collapse snapping to screen chrome components.
 * @see https://github.com/rnw-community/rnw-community/tree/master/packages/react-native-screen-chrome#screenchromeprovider
 */
export const ScreenChromeProvider = ({ children, colorScheme = ColorSchemeEnum.LIGHT, config }: Props): ReactNode => {
    const scrollRef = useAnimatedRef<ScrollView>();
    const scrollY = useScrollViewOffset(scrollRef);
    const reducedMotion = useReducedMotion();
    const resolvedConfig = useMemo(() => {
        const mergedConfig = mergeScreenChromeConfig(config);

        assertValidScreenChromeConfig(mergedConfig);

        return mergedConfig;
    }, [config]);
    const { collapseEnd, collapseStart, snapToCollapse } = resolvedConfig;

    const snapIfNeeded = useCallback(
        (offsetY: number): void => {
            'worklet';

            if (offsetY <= collapseStart || offsetY >= collapseEnd) {
                return;
            }

            const midpoint = (collapseStart + collapseEnd) / 2;
            const target = offsetY < midpoint ? collapseStart : collapseEnd;

            scrollTo(scrollRef, 0, target, !reducedMotion);
        },
        [collapseEnd, collapseStart, reducedMotion, scrollRef]
    );

    const scrollHandlers = useMemo<ScrollHandlers<Record<string, unknown>>>(
        () => ({
            onEndDrag: (event: ScrollEvent) => {
                'worklet';

                if (!snapToCollapse) {
                    return;
                }

                const velocityY = event.velocity?.y;

                if (typeof velocityY === 'number' && Math.abs(velocityY) >= MOMENTUM_VELOCITY_EPSILON) {
                    return;
                }

                snapIfNeeded(event.contentOffset.y);
            },
            onMomentumEnd: (event: ScrollEvent) => {
                'worklet';

                if (!snapToCollapse) {
                    return;
                }

                snapIfNeeded(event.contentOffset.y);
            },
        }),
        [snapIfNeeded, snapToCollapse]
    );
    const scrollHandler = useAnimatedScrollHandler(scrollHandlers);

    const contextValue = useMemo(
        () => ({ colorScheme, config: resolvedConfig, scrollHandler, scrollRef, scrollY }),
        [colorScheme, resolvedConfig, scrollHandler, scrollRef, scrollY]
    );

    return <ScreenChromeContext.Provider value={contextValue}>{children}</ScreenChromeContext.Provider>;
};
