import React from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { isDefined } from '@rnw-community/shared';

import { EdgeFade } from '../edge-fade/edge-fade';
import { useBottomChromeHeightPublisher } from '../hooks/use-bottom-chrome-height-publisher/use-bottom-chrome-height-publisher.hook';

import { screenChromeFooterStyles } from './screen-chrome-footer.styles';

import type { ScreenChromeFooterPropsInterface } from './screen-chrome-footer-props.interface';
import type { ReactNode } from 'react';

/**
 * Pins consumer footer content to the bottom edge over a bottom `EdgeFade` and publishes its measured height for `useBottomChromeInset`.
 * @see https://github.com/rnw-community/rnw-community/tree/master/packages/react-native-screen-chrome#screenchromefooter
 */
export const ScreenChromeFooter = ({
    bottomOffset = 0,
    children,
    contentStyle,
    edgeFadeProps,
    includeBottomSafeArea = true,
    style,
    testID,
    ...viewProps
}: ScreenChromeFooterPropsInterface): ReactNode => {
    const insets = useSafeAreaInsets();
    const safeAreaPadding = includeBottomSafeArea ? insets.bottom : 0;
    const contentPublisher = useBottomChromeHeightPublisher({ offset: bottomOffset + safeAreaPadding - insets.bottom });

    return (
        <View
            {...viewProps}
            pointerEvents="box-none"
            style={[screenChromeFooterStyles.container, { bottom: bottomOffset, paddingBottom: safeAreaPadding }, style]}
            testID={testID}
        >
            <EdgeFade position="bottom" {...edgeFadeProps} />
            <View
                {...contentPublisher}
                collapsable={false}
                style={[screenChromeFooterStyles.content, contentStyle]}
                {...(isDefined(testID) ? { testID: `${testID}-content` } : {})}
            >
                {children}
            </View>
        </View>
    );
};
