import React from 'react';
import { Text, View } from 'react-native';

import { CHROME_DEMO_STYLES as styles } from '../constant/chrome-demo-style';

import type { ChromeDemoItemInterface } from '../interface/chrome-demo-item.interface';

export const ChromeDemoListItem = ({ item }: { readonly item: ChromeDemoItemInterface }) => (
    <View style={styles.itemContainer} testID={`chrome-demo-item-${String(item.id)}`}>
        <Text style={styles.itemTitle}>{item.title}</Text>
        <Text style={styles.itemDetail}>{item.detail}</Text>
    </View>
);
