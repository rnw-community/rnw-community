import React from 'react';
import { Text, View } from 'react-native';

import {
    BottomChromeInsetProvider,
    EdgeFade,
    ScreenChromeFooter,
    ScreenChromeFrame,
    ScreenChromeHeader,
    ScreenChromeProvider,
    useBottomChromeInset,
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

const FOOTER_FADE_PROPS = { testID: 'footer-demo-fade' };

const FooterBand = () => (
    <ScreenChromeFooter edgeFadeProps={FOOTER_FADE_PROPS} testID="footer-demo-band">
        <View style={styles.footerContent} testID="footer-demo-bar">
            <Text style={styles.footerLabel}>Total</Text>
            <Text style={styles.footerLabel} testID="footer-demo-total">
                25
            </Text>
        </View>
    </ScreenChromeFooter>
);

const FooterDemoContent = () => {
    const headerTotalHeight = useScreenChromeHeaderMetrics();
    const { chromeHeight } = useBottomChromeInset();

    return (
        <>
            <ChromeDemoList
                contentInsetBottom={chromeHeight}
                contentInsetTop={headerTotalHeight}
                testID="footer-demo-scroll"
            />
            <FooterBand />
        </>
    );
};

export const FooterDemoScreen = () => (
    <ScreenChromeProvider>
        <BottomChromeInsetProvider>
            <ScreenChromeFrame>
                <FooterDemoContent />
                <EdgeFade position="top" testID="footer-demo-top-fade" />
                <FooterDemoHeader />
            </ScreenChromeFrame>
        </BottomChromeInsetProvider>
    </ScreenChromeProvider>
);
