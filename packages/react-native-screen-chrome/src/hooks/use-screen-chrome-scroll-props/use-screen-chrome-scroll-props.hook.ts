import { useMemo } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useCollapsibleHeaderScroll } from '@rnw-community/react-native-collapsible-header';

import { addScrollContentInset } from '../../util/add-scroll-content-inset/add-scroll-content-inset.util';
import { mergeRefs } from '../../util/merge-refs/merge-refs.util';
import { mergeScrollContentInset } from '../../util/merge-scroll-content-inset/merge-scroll-content-inset.util';
import { useScreenChrome } from '../use-screen-chrome/use-screen-chrome.hook';

import type { ScreenChromeScrollPropsOptionsInterface } from '../../interface/screen-chrome-scroll-props-options.interface';
import type { ScreenChromeScrollPropsInterface } from '../../interface/screen-chrome-scroll-props.interface';

const DEFAULT_CONTENT_INSET = 0;

/**
 * Composes the scroll handler, merged ref, throttle, content padding and indicator insets any scrollable needs for chrome.
 * @see https://github.com/rnw-community/rnw-community/tree/master/packages/react-native-screen-chrome#usescreenchromescrollprops
 */
export const useScreenChromeScrollProps = <T = unknown>({
    contentInsetTop = DEFAULT_CONTENT_INSET,
    contentInsetBottom = DEFAULT_CONTENT_INSET,
    contentInsetMode = 'replace',
    contentContainerStyle,
    ref,
}: ScreenChromeScrollPropsOptionsInterface<T> = {}): ScreenChromeScrollPropsInterface<T> => {
    const { config } = useScreenChrome();
    const { onScroll, scrollRef } = useCollapsibleHeaderScroll();
    const insets = useSafeAreaInsets();
    const mergedRef = useMemo(() => mergeRefs<T>(scrollRef, ref), [scrollRef, ref]);

    return {
        ref: mergedRef,
        onScroll,
        scrollEventThrottle: config.scrollEventThrottle,
        contentContainerStyle:
            contentInsetMode === 'additive'
                ? addScrollContentInset(insets, contentInsetTop, contentInsetBottom, contentContainerStyle)
                : mergeScrollContentInset(insets, contentInsetTop, contentInsetBottom, contentContainerStyle),
        scrollIndicatorInsets: { top: insets.top + contentInsetTop, bottom: insets.bottom + contentInsetBottom },
        automaticallyAdjustsScrollIndicatorInsets: false,
    };
};
