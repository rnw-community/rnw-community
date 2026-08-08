import React, { useMemo } from 'react';
import { ScrollView } from 'react-native';
import { createAnimatedComponent } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useScreenChrome } from '../hook/use-screen-chrome.hook.js';
import { mergeScrollContentInset } from '../utils/merge-scroll-content-inset.util.js';

import type { ComponentProps, ReactNode } from 'react';

const DEFAULT_CONTENT_INSET = 0;
const AnimatedScrollView = createAnimatedComponent(ScrollView);

interface Props extends Omit<ComponentProps<typeof ScrollView>, 'ref'> {
    readonly contentInsetTop?: number;
    readonly contentInsetBottom?: number;
}

/**
 * Connects an animated scroll view to the provider-owned scroll state and safe-area content padding.
 * @see https://github.com/rnw-community/rnw-community/tree/master/packages/react-native-screen-chrome#screenchromescrollview
 */
export const ScreenChromeScrollView = ({
    contentInsetTop = DEFAULT_CONTENT_INSET,
    contentInsetBottom = DEFAULT_CONTENT_INSET,
    contentContainerStyle,
    ...scrollViewProps
}: Props): ReactNode => {
    const { config, scrollHandler, scrollRef } = useScreenChrome();
    const insets = useSafeAreaInsets();
    const mergedContentContainerStyle = useMemo(
        () => mergeScrollContentInset(insets, contentInsetTop, contentInsetBottom, contentContainerStyle),
        [contentContainerStyle, contentInsetBottom, contentInsetTop, insets]
    );

    return (
        <AnimatedScrollView
            {...scrollViewProps}
            ref={scrollRef}
            contentContainerStyle={mergedContentContainerStyle}
            onScroll={scrollHandler}
            scrollEventThrottle={config.scrollEventThrottle}
        />
    );
};
