import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { Pressable, Text, View } from 'react-native';

import { emptyFn } from '@rnw-community/shared';

import { SettingsDemoStyles as styles } from '../constant/settings-demo-style';

import type { HeaderDemoStackParamList } from '../type/header-demo-stack-param-list.type';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

export const SettingsDemoActions = () => {
    const navigation = useNavigation<NativeStackNavigationProp<HeaderDemoStackParamList>>();
    const onBackPress = (): void => void navigation.goBack();

    return (
        <View pointerEvents="box-none" style={styles.iconRow}>
            <Pressable
                accessibilityRole="button"
                onPress={onBackPress}
                style={styles.iconButton}
                testID="settings-demo-back-button"
            >
                <Text style={styles.iconLabel}>‹</Text>
            </Pressable>
            <Pressable
                accessibilityRole="button"
                onPress={emptyFn}
                style={styles.iconButton}
                testID="settings-demo-more-button"
            >
                <Text style={styles.iconLabel}>⋯</Text>
            </Pressable>
        </View>
    );
};
