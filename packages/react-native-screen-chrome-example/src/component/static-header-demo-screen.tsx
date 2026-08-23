import React from 'react';
import { Text } from 'react-native';

import {
    EdgeFade,
    ScreenChromeFrame,
    ScreenChromeHeader,
    ScreenChromeProvider,
    useScreenChromeHeaderMetrics,
} from '@rnw-community/react-native-screen-chrome';

import { CHROME_DEMO_STYLES as styles } from '../constant/chrome-demo-style';

import { ChromeDemoList } from './chrome-demo-list';

const StaticDemoHeader = () => (
    <ScreenChromeHeader style={styles.headerBackdrop} testID="static-demo-header">
        <Text style={styles.slotText} testID="static-demo-title">
            Settings
        </Text>
        <Text style={styles.slotText} testID="static-demo-action">
            Edit
        </Text>
    </ScreenChromeHeader>
);

const StaticDemoContent = () => {
    const { recommendedContentTopGap } = useScreenChromeHeaderMetrics();

    // The metrics API replaces the app-side default-config re-merge: the gap equals the rendered header height.
    return <ChromeDemoList contentInsetTop={recommendedContentTopGap} testID="static-demo-scroll" />;
};

export const StaticHeaderDemoScreen = () => (
    <ScreenChromeProvider>
        <ScreenChromeFrame>
            <StaticDemoContent />
            <EdgeFade position="top" testID="static-demo-top-fade" />
            <StaticDemoHeader />
        </ScreenChromeFrame>
    </ScreenChromeProvider>
);
