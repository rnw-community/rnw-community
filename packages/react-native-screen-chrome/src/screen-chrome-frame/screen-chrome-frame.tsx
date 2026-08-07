import React from 'react';
import { View } from 'react-native';

import { screenChromeFrameStyles } from './screen-chrome-frame.styles.js';

import type { ReactNode } from 'react';
import type { ViewProps } from 'react-native';

interface Props extends ViewProps {
    readonly children: ReactNode;
}

/**
 * Provides the relative full-screen layout root for content, fades, and header chrome.
 * @see https://github.com/rnw-community/rnw-community/tree/master/packages/react-native-screen-chrome#screenchromeframe
 */
export const ScreenChromeFrame = ({ children, style, ...viewProps }: Props): ReactNode => (
    <View {...viewProps} style={[screenChromeFrameStyles.frame, style]}>
        {children}
    </View>
);
