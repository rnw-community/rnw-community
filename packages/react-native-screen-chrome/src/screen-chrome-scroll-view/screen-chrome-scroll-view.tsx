import React, { useMemo } from 'react';
import { ScrollView } from 'react-native';
import { createAnimatedComponent } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useCollapsibleHeaderScroll } from '@rnw-community/react-native-collapsible-header';

import { useScreenChrome } from '../hooks/use-screen-chrome/use-screen-chrome.hook';
import { addScrollContentInset } from '../util/add-scroll-content-inset/add-scroll-content-inset.util';
import { mergeRefs } from '../util/merge-refs/merge-refs.util';
import { mergeScrollContentInset } from '../util/merge-scroll-content-inset/merge-scroll-content-inset.util';

import type { ScrollContentInsetMode } from '../type/scroll-content-inset-mode.type';
import type { ComponentProps, ReactNode, Ref } from 'react';

const DEFAULT_CONTENT_INSET = 0;
const AnimatedScrollView = createAnimatedComponent(ScrollView);

interface Props extends Omit<ComponentProps<typeof ScrollView>, 'onScroll' | 'scrollEventThrottle'> {
    readonly contentInsetTop?: number;
    readonly contentInsetBottom?: number;
    readonly contentInsetMode?: ScrollContentInsetMode;
    readonly ref?: Ref<ScrollView>;
}

/**
 * Connects an animated scroll view to the collapsible-header scroll wiring and safe-area content padding.
 * @see https://github.com/rnw-community/rnw-community/tree/master/packages/react-native-screen-chrome#screenchromescrollview
 */
export const ScreenChromeScrollView = ({
    contentInsetTop = DEFAULT_CONTENT_INSET,
    contentInsetBottom = DEFAULT_CONTENT_INSET,
    contentInsetMode = 'replace',
    contentContainerStyle,
    ref,
    ...scrollViewProps
}: Props): ReactNode => {
    const { config } = useScreenChrome();
    const { onScroll, scrollRef } = useCollapsibleHeaderScroll();
    const insets = useSafeAreaInsets();
    const mergedRef = useMemo(() => mergeRefs<ScrollView>(scrollRef, ref), [scrollRef, ref]);
    const mergedContentContainerStyle =
        contentInsetMode === 'additive'
            ? addScrollContentInset(insets, contentInsetTop, contentInsetBottom, contentContainerStyle)
            : mergeScrollContentInset(insets, contentInsetTop, contentInsetBottom, contentContainerStyle);

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
