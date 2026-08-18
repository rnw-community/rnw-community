import React from 'react';
import Animated from 'react-native-reanimated';

import { useCollapsibleHeaderScroll } from '@rnw-community/react-native-collapsible-header';

import { HeaderDemoItems } from '../constant/header-demo-items';
import { HeaderDemoStyles as styles } from '../constant/header-demo-style';

import { HeaderDemoListItem } from './header-demo-list-item';

export const HeaderDemoList = () => {
    const { onScroll, scrollRef } = useCollapsibleHeaderScroll();

    return (
        <Animated.ScrollView
            contentContainerStyle={styles.listContent}
            onScroll={onScroll}
            ref={scrollRef}
            scrollEventThrottle={16}
            style={styles.list}
            testID="header-demo-scroll-view"
        >
            {HeaderDemoItems.map(item => (
                <HeaderDemoListItem item={item} key={item.id} />
            ))}
        </Animated.ScrollView>
    );
};
