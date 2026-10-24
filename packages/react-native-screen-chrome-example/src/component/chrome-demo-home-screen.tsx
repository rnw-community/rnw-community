import React from 'react';
import { ScrollView, Text } from 'react-native';

import { CHROME_DEMO_STYLES as styles } from '../constant/chrome-demo-style';

import { ChromeDemoLink } from './chrome-demo-link';

import type { ChromeDemoStackParamList } from '../type/chrome-demo-stack-param-list.type';

const CHROME_DEMO_LINKS: ReadonlyArray<{
    readonly screen: keyof ChromeDemoStackParamList;
    readonly target: string;
    readonly testID: string;
}> = [
    { screen: 'Collapsible', target: 'Collapsible header', testID: 'home-open-collapsible' },
    { screen: 'StaticHeader', target: 'Static header', testID: 'home-open-static-header' },
    { screen: 'Footer', target: 'Header and footer', testID: 'home-open-footer' },
    { screen: 'SnapOff', target: 'Snap off', testID: 'home-open-snap-off' },
    { screen: 'BottomFade', target: 'Scroll-driven bottom fade', testID: 'home-open-bottom-fade' },
    { screen: 'TabBar', target: 'Floating tab bar', testID: 'home-open-tab-bar' },
    { screen: 'Keyboard', target: 'Keyboard-sticky footer', testID: 'home-open-keyboard' },
    { screen: 'Theme', target: 'Light and dark', testID: 'home-open-theme' },
    { screen: 'EdgeFade', target: 'Edge fade ramp', testID: 'home-open-edge-fade' },
    { screen: 'Playground', target: 'Edge chrome playground', testID: 'home-open-playground' },
];

export const ChromeDemoHomeScreen = ({ navigate }: { readonly navigate: (screen: string) => void }) => (
    <ScrollView contentContainerStyle={styles.homeContainer}>
        <Text style={styles.homeTitle}>Screen chrome demos</Text>
        {CHROME_DEMO_LINKS.map(({ screen, target, testID }) => (
            <ChromeDemoLink key={screen} onPress={() => void navigate(screen)} target={target} testID={testID} />
        ))}
    </ScrollView>
);
