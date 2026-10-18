import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import {
    BottomChromeInsetProvider,
    ScreenChromeFooter,
    ScreenChromeFrame,
    ScreenChromeHeader,
    ScreenChromeProvider,
    useBottomChromeInset,
    useScreenChromeHeaderMetrics,
} from '@rnw-community/react-native-screen-chrome';

import { CHROME_DEMO_STYLES as styles } from '../constant/chrome-demo-style';

import { ChromeDemoList } from './chrome-demo-list';

const TAB_DEMO_TABS = ['Home', 'Search', 'Profile'] as const;

interface TabBarProps {
    readonly onSelect: (tab: string) => void;
    readonly selectedTab: string;
}

const FloatingTabBar = ({ onSelect, selectedTab }: TabBarProps) => (
    <ScreenChromeFooter contentStyle={styles.tabBarAnchor} testID="tab-demo-bar">
        <View collapsable={false} style={styles.tabBar}>
            {TAB_DEMO_TABS.map(tab => (
                <Pressable
                    accessibilityRole="tab"
                    accessibilityState={{ selected: tab === selectedTab }}
                    key={tab}
                    onPress={() => void onSelect(tab)}
                    style={[styles.tab, tab === selectedTab && styles.tabSelected]}
                    testID={`tab-demo-tab-${tab.toLowerCase()}`}
                >
                    <Text style={styles.footerLabel}>{tab}</Text>
                </Pressable>
            ))}
        </View>
    </ScreenChromeFooter>
);

const TabBarDemoContent = () => {
    const [selectedTab, setSelectedTab] = useState<string>(TAB_DEMO_TABS[0]);
    const headerTotalHeight = useScreenChromeHeaderMetrics();
    const { chromeHeight } = useBottomChromeInset();

    return (
        <>
            <ChromeDemoList contentInsetBottom={chromeHeight} contentInsetTop={headerTotalHeight} testID="tab-demo-scroll" />
            <ScreenChromeHeader style={styles.headerBackdrop} testID="tab-demo-header">
                <Text style={styles.slotText} testID="tab-demo-title">
                    {selectedTab}
                </Text>
            </ScreenChromeHeader>
            <FloatingTabBar onSelect={setSelectedTab} selectedTab={selectedTab} />
        </>
    );
};

export const TabBarDemoScreen = () => (
    <ScreenChromeProvider>
        <BottomChromeInsetProvider>
            <ScreenChromeFrame>
                <TabBarDemoContent />
            </ScreenChromeFrame>
        </BottomChromeInsetProvider>
    </ScreenChromeProvider>
);
