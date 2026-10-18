import React from 'react';
import { View } from 'react-native';

import { ScreenChromeScrollView } from '@rnw-community/react-native-screen-chrome';

import { CHROME_DEMO_ITEMS } from '../constant/chrome-demo-items';
import { CHROME_DEMO_STYLES as styles } from '../constant/chrome-demo-style';

import { ChromeDemoListItem } from './chrome-demo-list-item';

import type { ScreenChromeColorScheme } from '@rnw-community/react-native-screen-chrome';

interface Props {
    readonly colorScheme?: ScreenChromeColorScheme;
    readonly contentInsetBottom?: number;
    readonly contentInsetTop?: number;
    readonly testID: string;
}

const DEMO_LIST_LEADING_GAP = 8;
const DEMO_LIST_TRAILING_INSET = 120;

export const ChromeDemoList = ({
    colorScheme = 'light',
    contentInsetBottom = DEMO_LIST_TRAILING_INSET,
    contentInsetTop = 0,
    testID,
}: Props) => (
    <ScreenChromeScrollView
        contentContainerStyle={styles.listContent}
        contentInsetBottom={contentInsetBottom}
        contentInsetTop={contentInsetTop + DEMO_LIST_LEADING_GAP}
        testID={testID}
    >
        <View>
            {CHROME_DEMO_ITEMS.map(item => (
                <ChromeDemoListItem colorScheme={colorScheme} item={item} key={item.id} />
            ))}
        </View>
    </ScreenChromeScrollView>
);
