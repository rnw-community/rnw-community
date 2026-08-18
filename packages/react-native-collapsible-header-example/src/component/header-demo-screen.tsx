import React from 'react';
import { View } from 'react-native';

import { CollapsibleHeader } from '@rnw-community/react-native-collapsible-header';

import { HeaderDemoGeometry } from '../constant/header-demo-geometry';
import { HeaderDemoStyles as styles } from '../constant/header-demo-style';

import { HeaderDemoActions } from './header-demo-actions';
import { HeaderDemoCollapsedSummary } from './header-demo-collapsed-summary';
import { HeaderDemoExpandedSummary } from './header-demo-expanded-summary';
import { HeaderDemoList } from './header-demo-list';

export const HeaderDemoScreen = () => (
    <View style={styles.screen}>
        <CollapsibleHeader
            snap
            stretchOnOverscroll
            backgroundStyle={styles.headerBackground}
            collapsedContent={<HeaderDemoCollapsedSummary />}
            collapsedHeight={HeaderDemoGeometry.collapsedHeight}
            expandedContent={<HeaderDemoExpandedSummary />}
            expandedHeight={HeaderDemoGeometry.expandedHeight}
            persistentContent={<HeaderDemoActions />}
            style={styles.header}
            testID="header-demo-header"
        />
        <HeaderDemoList />
    </View>
);
