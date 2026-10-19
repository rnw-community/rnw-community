import React from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { isDefined } from '@rnw-community/shared';

import { useScreenChrome } from '../hooks/use-screen-chrome/use-screen-chrome.hook';

import { screenChromeHeaderStyles } from './screen-chrome-header.styles';

import type { ReactNode } from 'react';
import type { StyleProp, ViewProps, ViewStyle } from 'react-native';

interface Props extends Omit<ViewProps, 'children' | 'pointerEvents'> {
    readonly children: ReactNode;
    readonly rowStyle?: StyleProp<ViewStyle>;
    readonly topInset?: number;
}

/**
 * Renders a static, non-collapsible header row with the same safe-area and paint-order contract as the collapsible one.
 * @see https://github.com/rnw-community/rnw-community/tree/master/packages/react-native-screen-chrome#screenchromeheader
 */
export const ScreenChromeHeader = ({ children, rowStyle, style, testID, topInset = 0, ...viewProps }: Props): ReactNode => {
    const { config } = useScreenChrome();
    const insets = useSafeAreaInsets();

    return (
        <View
            {...viewProps}
            pointerEvents="box-none"
            style={[screenChromeHeaderStyles.container, { paddingTop: insets.top + topInset }, style]}
            testID={testID}
        >
            <View
                pointerEvents="box-none"
                style={[screenChromeHeaderStyles.row, rowStyle, { height: config.headerHeight }]}
                {...(isDefined(testID) ? { testID: `${testID}-row` } : {})}
            >
                {children}
            </View>
        </View>
    );
};
