import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { Pressable, SafeAreaView, Text, View } from 'react-native';

import { HeaderDemoStyles as styles } from '../constant/header-demo-style';

import type { HeaderDemoStackParamList } from '../type/header-demo-stack-param-list.type';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

export const HeaderDemoDetailsScreen = () => {
    const navigation = useNavigation<NativeStackNavigationProp<HeaderDemoStackParamList>>();
    const onBackPress = (): void => void navigation.goBack();

    return (
        <SafeAreaView style={styles.detailsSafeArea}>
            <View style={styles.detailsScreen}>
                <Text style={styles.detailsTitle} testID="header-demo-details-title">
                    Details
                </Text>
                <Pressable
                    accessibilityRole="button"
                    onPress={onBackPress}
                    style={styles.detailsBackButton}
                    testID="header-demo-details-back-button"
                >
                    <Text style={styles.detailsBackLabel}>Go back</Text>
                </Pressable>
            </View>
        </SafeAreaView>
    );
};
