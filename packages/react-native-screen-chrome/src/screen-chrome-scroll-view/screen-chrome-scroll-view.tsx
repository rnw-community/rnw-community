import React from 'react';
import { ScrollView } from 'react-native';
import { createAnimatedComponent } from 'react-native-reanimated';

import { useScreenChromeScrollProps } from '../hooks/use-screen-chrome-scroll-props/use-screen-chrome-scroll-props.hook';

import type { ScrollContentInsetMode } from '../type/scroll-content-inset-mode.type';
import type { ComponentProps, ComponentRef, ReactNode, Ref } from 'react';

const AnimatedScrollView = createAnimatedComponent(ScrollView);

interface Props extends Omit<ComponentProps<typeof ScrollView>, 'onScroll' | 'scrollEventThrottle'> {
    readonly contentInsetTop?: number;
    readonly contentInsetBottom?: number;
    readonly contentInsetMode?: ScrollContentInsetMode;
    readonly includeTopSafeArea?: boolean;
    readonly ref?: Ref<ComponentRef<typeof ScrollView>>;
}

/**
 * Connects an animated scroll view to the collapsible-header scroll wiring and safe-area content padding.
 * @see https://github.com/rnw-community/rnw-community/tree/master/packages/react-native-screen-chrome#screenchromescrollview
 */
export const ScreenChromeScrollView = ({
    contentInsetTop,
    contentInsetBottom,
    contentInsetMode,
    contentContainerStyle,
    includeTopSafeArea,
    ref,
    ...scrollViewProps
}: Props): ReactNode => {
    const { automaticallyAdjustsScrollIndicatorInsets, scrollIndicatorInsets, ...packageOwnedProps } =
        useScreenChromeScrollProps({
            contentInsetTop,
            contentInsetBottom,
            contentInsetMode,
            contentContainerStyle,
            includeTopSafeArea,
            ref,
        });

    return (
        <AnimatedScrollView
            automaticallyAdjustsScrollIndicatorInsets={automaticallyAdjustsScrollIndicatorInsets}
            scrollIndicatorInsets={scrollIndicatorInsets}
            {...scrollViewProps}
            {...packageOwnedProps}
        />
    );
};
