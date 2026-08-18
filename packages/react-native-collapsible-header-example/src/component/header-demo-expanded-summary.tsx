import React from 'react';
import { Text, View } from 'react-native';
import Animated, { Extrapolation, interpolate, useAnimatedStyle } from 'react-native-reanimated';

import { useCollapsibleHeaderProgress } from '@rnw-community/react-native-collapsible-header';

import { HeaderDemoStyles as styles } from '../constant/header-demo-style';

export const HeaderDemoExpandedSummary = () => {
    const progress = useCollapsibleHeaderProgress();
    const badgeAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: interpolate(progress.get(), [0, 1], [1, 0.5], Extrapolation.CLAMP) }],
    }));

    return (
        <View style={styles.expandedSummary} testID="header-demo-expanded-summary">
            <Animated.View style={[styles.expandedBadge, badgeAnimatedStyle]} />
            <Text style={styles.expandedAmount} testID="header-demo-expanded-amount">
                $12,345.67
            </Text>
            <Text style={styles.expandedSubtitle}>Total balance</Text>
        </View>
    );
};
