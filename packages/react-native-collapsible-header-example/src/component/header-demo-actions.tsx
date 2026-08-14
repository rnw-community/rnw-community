import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { Pressable, Text, View } from 'react-native';

import { HeaderDemoStyles as styles } from '../constant/header-demo-style';

import type { HeaderDemoStackParamList } from '../type/header-demo-stack-param-list.type';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

export const HeaderDemoActions = () => {
    const navigation = useNavigation<NativeStackNavigationProp<HeaderDemoStackParamList>>();
    const onDetailsPress = (): void => void navigation.navigate('Details');

    return (
        <View pointerEvents="box-none" style={styles.actionsRow}>
            <Pressable
                accessibilityRole="button"
                onPress={onDetailsPress}
                style={styles.actionButton}
                testID="header-demo-details-button"
            >
                <Text style={styles.actionLabel}>→</Text>
            </Pressable>
        </View>
    );
};
