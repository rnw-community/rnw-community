import React from 'react';
import { View } from 'react-native';

import { ScreenChromeScrollView } from '@rnw-community/react-native-screen-chrome';

import { CHROME_DEMO_ITEMS } from '../constant/chrome-demo-items';
import { CHROME_DEMO_STYLES as styles } from '../constant/chrome-demo-style';

import { ChromeDemoListItem } from './chrome-demo-list-item';

interface Props {
    readonly contentInsetBottom?: number;
    readonly contentInsetTop?: number;
    readonly testID: string;
}

const DEMO_LIST_TRAILING_INSET = 120;

export const ChromeDemoList = ({ contentInsetBottom = DEMO_LIST_TRAILING_INSET, contentInsetTop, testID }: Props) => (
    <ScreenChromeScrollView
        contentContainerStyle={styles.listContent}
        contentInsetBottom={contentInsetBottom}
        contentInsetTop={contentInsetTop}
        testID={testID}
    >
        <View>
            {CHROME_DEMO_ITEMS.map(item => (
                <ChromeDemoListItem item={item} key={item.id} />
            ))}
        </View>
    </ScreenChromeScrollView>
);
