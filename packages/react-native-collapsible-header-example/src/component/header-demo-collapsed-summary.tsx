import React from 'react';
import { Text, View } from 'react-native';

import { HeaderDemoStyles as styles } from '../constant/header-demo-style';

export const HeaderDemoCollapsedSummary = () => (
    <View style={styles.collapsedRow} testID="header-demo-collapsed-summary">
        <Text style={styles.collapsedLabel}>Total balance</Text>
        <Text style={styles.collapsedAmount} testID="header-demo-collapsed-amount">
            $12,345.67
        </Text>
    </View>
);
