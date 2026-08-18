import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { Pressable, Text } from 'react-native';

import { HeaderDemoStyles as styles } from '../constant/header-demo-style';

import type { HeaderDemoItem } from '../interface/header-demo-item.interface';
import type { HeaderDemoStackParamList } from '../type/header-demo-stack-param-list.type';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

export const HeaderDemoListItem = ({ item }: { readonly item: HeaderDemoItem }) => {
    const navigation = useNavigation<NativeStackNavigationProp<HeaderDemoStackParamList>>();
    const onItemPress = (): void => void navigation.navigate('Details');

    return (
        <Pressable
            accessibilityRole="button"
            onPress={onItemPress}
            style={styles.item}
            testID={`header-demo-item-${String(item.id)}`}
        >
            <Text style={styles.itemLabel}>{item.label}</Text>
        </Pressable>
    );
};
