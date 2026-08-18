import React from 'react';
import { Text, View } from 'react-native';

import { SettingsDemoStyles as styles } from '../constant/settings-demo-style';

export const SettingsDemoSmallTitle = () => (
    <View style={styles.smallTitleRow} testID="settings-demo-small-title">
        <Text style={styles.smallTitle}>Settings</Text>
    </View>
);
