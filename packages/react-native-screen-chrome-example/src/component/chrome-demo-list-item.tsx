import React from 'react';
import { Text, View } from 'react-native';

import { CHROME_DEMO_STYLES as styles } from '../constant/chrome-demo-style';

import type { ChromeDemoItemInterface } from '../interface/chrome-demo-item.interface';
import type { ScreenChromeColorScheme } from '@rnw-community/react-native-screen-chrome';

interface Props {
    readonly colorScheme: ScreenChromeColorScheme;
    readonly item: ChromeDemoItemInterface;
}

export const ChromeDemoListItem = ({ colorScheme, item }: Props) => {
    const isDark = colorScheme === 'dark';

    return (
        <View style={styles.itemContainer} testID={`chrome-demo-item-${String(item.id)}`}>
            <Text style={[styles.itemTitle, isDark && styles.itemTitleDark]}>{item.title}</Text>
            <Text style={[styles.itemDetail, isDark && styles.itemDetailDark]}>{item.detail}</Text>
        </View>
    );
};
