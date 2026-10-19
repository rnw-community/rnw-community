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

import type { EdgeFadeScrollAnimationInterface } from '@rnw-community/react-native-screen-chrome';

const BOTTOM_FADE_FULL_OFFSET = 160;
const BOTTOM_FADE_SCROLL_ANIMATION: EdgeFadeScrollAnimationInterface = {
    intensityInputRange: [0, BOTTOM_FADE_FULL_OFFSET],
    opacityInputRange: [0, BOTTOM_FADE_FULL_OFFSET],
};

const BottomFadeDemoContent = () => {
    const headerTotalHeight = useScreenChromeHeaderMetrics();

    return <ChromeDemoList contentInsetTop={headerTotalHeight} testID="bottom-fade-demo-scroll" />;
};

export const BottomFadeDemoScreen = () => (
    <ScreenChromeProvider>
        <ScreenChromeFrame>
            <BottomFadeDemoContent />
            <EdgeFade position="bottom" scrollAnimation={BOTTOM_FADE_SCROLL_ANIMATION} testID="bottom-fade-demo-fade" />
            <ScreenChromeHeader style={styles.headerBackdrop} testID="bottom-fade-demo-header">
                <Text style={styles.slotText} testID="bottom-fade-demo-title">
                    Activity
                </Text>
            </ScreenChromeHeader>
        </ScreenChromeFrame>
    </ScreenChromeProvider>
);
