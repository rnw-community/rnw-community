import React from 'react';
import { Text, View } from 'react-native';

import {
    CollapsibleHeader,
    CollapsibleHeaderSlot,
    CollapsibleHeaderTitleSlot,
} from '@rnw-community/react-native-screen-chrome';

import { CHROME_DEMO_STYLES as styles } from '../constant/chrome-demo-style';

const COLLAPSIBLE_DEMO_MOTION = { backgroundOpacityStartProgress: 0.7 };

export const ChromeDemoCollapsibleHeader = ({ testIDPrefix }: { readonly testIDPrefix: string }) => (
    <CollapsibleHeader motion={COLLAPSIBLE_DEMO_MOTION} style={styles.headerBackdrop} testID={`${testIDPrefix}-header`}>
        <CollapsibleHeaderSlot testID={`${testIDPrefix}-leading`}>
            <Text style={styles.slotText}>Menu</Text>
        </CollapsibleHeaderSlot>
        <CollapsibleHeaderTitleSlot>
            <View testID={`${testIDPrefix}-expanded-title`}>
                <Text style={[styles.slotText, { fontSize: 28 }]}>Ledger</Text>
            </View>
            <Text style={styles.slotText} testID={`${testIDPrefix}-collapsed-title`}>
                Ledger
            </Text>
        </CollapsibleHeaderTitleSlot>
        <CollapsibleHeaderSlot testID={`${testIDPrefix}-trailing`}>
            <Text style={styles.slotText}>Add</Text>
        </CollapsibleHeaderSlot>
    </CollapsibleHeader>
);
