import React from 'react';
import { SafeAreaView, StatusBar } from 'react-native';

import { CollapsibleHeaderProvider } from '@rnw-community/react-native-collapsible-header';

import { HeaderDemoStyles as styles } from '../constant/header-demo-style';

import { HeaderDemoScreen } from './header-demo-screen';

export const HeaderDemoHomeScreen = () => (
    <CollapsibleHeaderProvider>
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="light-content" />
            <HeaderDemoScreen />
        </SafeAreaView>
    </CollapsibleHeaderProvider>
);
