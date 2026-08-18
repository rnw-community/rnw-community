import React from 'react';
import { SafeAreaView, StatusBar, View } from 'react-native';

import { CollapsibleHeader, CollapsibleHeaderProvider } from '@rnw-community/react-native-collapsible-header';

import { SettingsDemoStyles as styles } from '../constant/settings-demo-style';

import { SettingsDemoActions } from './settings-demo-actions';
import { SettingsDemoLargeTitle } from './settings-demo-large-title';
import { SettingsDemoList } from './settings-demo-list';
import { SettingsDemoSmallTitle } from './settings-demo-small-title';

const SETTINGS_EXPANDED_HEIGHT = 120;
const SETTINGS_COLLAPSED_HEIGHT = 56;
const SETTINGS_MOTION = {
    expandedTranslateY: -8,
    expandedScale: 1,
    collapsedTranslateY: 4,
};

export const SettingsDemoScreen = () => (
    <CollapsibleHeaderProvider>
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" />
            <View style={styles.screen}>
                <CollapsibleHeader
                    snap
                    testID="settings-demo-header"
                    expandedHeight={SETTINGS_EXPANDED_HEIGHT}
                    collapsedHeight={SETTINGS_COLLAPSED_HEIGHT}
                    style={styles.header}
                    backgroundStyle={styles.headerBackground}
                    motion={SETTINGS_MOTION}
                    expandedContent={<SettingsDemoLargeTitle />}
                    collapsedContent={<SettingsDemoSmallTitle />}
                    persistentContent={<SettingsDemoActions />}
                />
                <SettingsDemoList />
            </View>
        </SafeAreaView>
    </CollapsibleHeaderProvider>
);
