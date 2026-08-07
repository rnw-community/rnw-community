import React, { useMemo } from 'react';
import { ScrollView } from 'react-native';
import { createAnimatedComponent } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useScreenChromeScrollHandler } from '../hook/use-screen-chrome-scroll-handler.hook.js';
import { useScreenChrome } from '../hook/use-screen-chrome.hook.js';
import { mergeRefs } from '../utils/merge-refs.util.js';
import { mergeScrollContentInset } from '../utils/merge-scroll-content-inset.util.js';

import type { ComponentProps, ReactNode, Ref } from 'react';

const DEFAULT_CONTENT_INSET = 0;
const AnimatedScrollView = createAnimatedComponent(ScrollView);

interface Props extends ComponentProps<typeof ScrollView> {
    readonly contentInsetTop?: number;
    readonly contentInsetBottom?: number;
    readonly ref?: Ref<ScrollView>;
}

/**
 * Connects an animated scroll view to the provider-owned scroll state and safe-area content padding.
 * @see https://github.com/rnw-community/rnw-community/tree/master/packages/react-native-screen-chrome#screenchromescrollview
 */
export const ScreenChromeScrollView = ({
    contentInsetTop = DEFAULT_CONTENT_INSET,
    contentInsetBottom = DEFAULT_CONTENT_INSET,
    contentContainerStyle,
    ref,
    ...scrollViewProps
}: Props): ReactNode => {
    const { config, scrollRef } = useScreenChrome();
    const insets = useSafeAreaInsets();
    const onScroll = useScreenChromeScrollHandler();
    const mergedRef = useMemo(() => mergeRefs(scrollRef, ref), [scrollRef, ref]);
    const mergedContentContainerStyle = useMemo(
        () => mergeScrollContentInset(insets, contentInsetTop, contentInsetBottom, contentContainerStyle),
        [contentContainerStyle, contentInsetBottom, contentInsetTop, insets]
    );

    return (
        <AnimatedScrollView
            {...scrollViewProps}
            ref={mergedRef}
            contentContainerStyle={mergedContentContainerStyle}
            onScroll={onScroll}
            scrollEventThrottle={config.scrollEventThrottle}
        />
    );
};
