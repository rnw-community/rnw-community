import React from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EdgeFade, getEdgeFadeBandMetrics, useScreenChrome } from '@rnw-community/react-native-screen-chrome';

import { CHROME_DEMO_STYLES as styles } from '../constant/chrome-demo-style';

import type { EdgeFadePropsInterface } from '@rnw-community/react-native-screen-chrome';

export const AccessibleEdgeFade = ({ testID, ...edgeFadeProps }: EdgeFadePropsInterface) => {
    const { config } = useScreenChrome();
    const insets = useSafeAreaInsets();
    const bandMetrics = getEdgeFadeBandMetrics(edgeFadeProps.position, edgeFadeProps.height, config, insets);

    return (
        <View accessible pointerEvents="none" style={[styles.accessibleEdgeFade, bandMetrics]} testID={testID}>
            <EdgeFade {...edgeFadeProps} />
        </View>
    );
};
