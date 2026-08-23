import React from 'react';
import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
    EdgeFade,
    ScreenChromeFrame,
    ScreenChromeHeader,
    ScreenChromeProvider,
    useScreenChromeHeaderMetrics,
} from '@rnw-community/react-native-screen-chrome';

import { CHROME_DEMO_STYLES as styles } from '../constant/chrome-demo-style';

import { ChromeDemoList } from './chrome-demo-list';

const FooterDemoHeader = () => (
    <ScreenChromeHeader style={styles.headerBackdrop} testID="footer-demo-header">
        <Text style={styles.slotText} testID="footer-demo-title">
            Accounts
        </Text>
    </ScreenChromeHeader>
);

const FooterBand = () => {
    const insets = useSafeAreaInsets();

    return (
        <View
            pointerEvents="box-none"
            style={[styles.footerBand, { paddingBottom: insets.bottom }]}
            testID="footer-demo-band"
        >
            <EdgeFade position="bottom" testID="footer-demo-fade" />
            <View style={styles.footerContent} testID="footer-demo-bar">
                <Text style={styles.footerLabel}>Total</Text>
                <Text style={styles.footerLabel} testID="footer-demo-total">
                    25
                </Text>
            </View>
        </View>
    );
};

const FooterDemoContent = () => {
    const { recommendedContentTopGap } = useScreenChromeHeaderMetrics();

    return (
        <>
            <ChromeDemoList contentInsetBottom={96} contentInsetTop={recommendedContentTopGap} testID="footer-demo-scroll" />
            <FooterBand />
        </>
    );
};

export const FooterDemoScreen = () => (
    <ScreenChromeProvider>
        <ScreenChromeFrame>
            <FooterDemoContent />
            <EdgeFade position="top" testID="footer-demo-top-fade" />
            <FooterDemoHeader />
        </ScreenChromeFrame>
    </ScreenChromeProvider>
);
