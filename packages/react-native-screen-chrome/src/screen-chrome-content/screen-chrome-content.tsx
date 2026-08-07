import React from 'react';
import { View } from 'react-native';

import { screenChromeContentStyles } from './screen-chrome-content.styles.js';

import type { ReactNode } from 'react';
import type { ViewProps } from 'react-native';

interface Props extends ViewProps {
    readonly children: ReactNode;
}

/**
 * Renders the primary screen content layer below decorative fades and interactive header chrome.
 * @see https://github.com/rnw-community/rnw-community/tree/master/packages/react-native-screen-chrome#screenchromecontent
 */
export const ScreenChromeContent = ({ children, style, ...viewProps }: Props): ReactNode => (
    <View {...viewProps} style={[screenChromeContentStyles.content, style]}>
        {children}
    </View>
);
