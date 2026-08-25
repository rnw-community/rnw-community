import React from 'react';
import { Text, View } from 'react-native';

import {
    CollapsibleHeader,
    CollapsibleHeaderSlot,
    CollapsibleHeaderTitleSlot,
    EdgeFade,
    ScreenChromeFrame,
    ScreenChromeProvider,
} from '@rnw-community/react-native-screen-chrome';

import { CHROME_DEMO_STYLES as styles } from '../constant/chrome-demo-style';

import { ChromeDemoList } from './chrome-demo-list';

const CollapsibleDemoHeader = () => (
    <CollapsibleHeader
        motion={{ backgroundOpacityStartProgress: 0.7 }}
        style={styles.headerBackdrop}
        testID="collapsible-demo-header"
    >
        <CollapsibleHeaderSlot testID="collapsible-demo-leading">
            <Text style={styles.slotText}>Menu</Text>
        </CollapsibleHeaderSlot>
        <CollapsibleHeaderTitleSlot>
            <View testID="collapsible-demo-expanded-title">
                <Text style={[styles.slotText, { fontSize: 28 }]}>Ledger</Text>
            </View>
            <Text style={styles.slotText} testID="collapsible-demo-collapsed-title">
                Ledger
            </Text>
        </CollapsibleHeaderTitleSlot>
        <CollapsibleHeaderSlot testID="collapsible-demo-trailing">
            <Text style={styles.slotText}>Add</Text>
        </CollapsibleHeaderSlot>
    </CollapsibleHeader>
);

export const CollapsibleDemoScreen = () => (
    <ScreenChromeProvider config={{ snapToCollapse: true }}>
        <ScreenChromeFrame>
            <ChromeDemoList testID="collapsible-demo-scroll" />
            <EdgeFade position="top" testID="collapsible-demo-top-fade" />
            <CollapsibleDemoHeader />
        </ScreenChromeFrame>
    </ScreenChromeProvider>
);
