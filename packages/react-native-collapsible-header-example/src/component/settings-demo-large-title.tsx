import React from 'react';
import { Text, View } from 'react-native';

import { SettingsDemoStyles as styles } from '../constant/settings-demo-style';

export const SettingsDemoLargeTitle = () => (
    <View style={styles.largeTitleSlot} testID="settings-demo-large-title">
        <Text style={styles.largeTitle}>Settings</Text>
    </View>
);
