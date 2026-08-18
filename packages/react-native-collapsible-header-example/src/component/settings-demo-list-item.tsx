import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { Pressable, Text } from 'react-native';

import { SettingsDemoStyles as styles } from '../constant/settings-demo-style';

import type { HeaderDemoStackParamList } from '../type/header-demo-stack-param-list.type';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

export const SettingsDemoListItem = ({
    item,
}: {
    readonly item: { readonly id: number; readonly label: string; readonly value: string };
}) => {
    const navigation = useNavigation<NativeStackNavigationProp<HeaderDemoStackParamList>>();
    const onItemPress = (): void => void navigation.navigate('Details');

    return (
        <Pressable
            accessibilityRole="button"
            onPress={onItemPress}
            style={styles.item}
            testID={`settings-demo-item-${String(item.id)}`}
        >
            <Text style={styles.itemLabel}>{item.label}</Text>
            <Text style={styles.itemValue}>{item.value}</Text>
        </Pressable>
    );
};
