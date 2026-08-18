import React from 'react';
import Animated from 'react-native-reanimated';

import { useCollapsibleHeaderScroll } from '@rnw-community/react-native-collapsible-header';

import { SettingsDemoItems } from '../constant/settings-demo-items';
import { SettingsDemoStyles as styles } from '../constant/settings-demo-style';

import { SettingsDemoListItem } from './settings-demo-list-item';

export const SettingsDemoList = () => {
    const { onScroll, scrollRef } = useCollapsibleHeaderScroll();

    return (
        <Animated.ScrollView
            contentContainerStyle={styles.listContent}
            onScroll={onScroll}
            ref={scrollRef}
            scrollEventThrottle={16}
            style={styles.list}
            testID="settings-demo-scroll-view"
        >
            {SettingsDemoItems.map(item => (
                <SettingsDemoListItem item={item} key={item.id} />
            ))}
        </Animated.ScrollView>
    );
};
