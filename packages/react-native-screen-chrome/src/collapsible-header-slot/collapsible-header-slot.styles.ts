import { StyleSheet } from 'react-native';

import { SCREEN_CHROME_HEADER_LAYOUT_METRICS } from '../constant/screen-chrome-header-layout-metrics.constant';

export const collapsibleHeaderSlotStyles = StyleSheet.create({
    slot: {
        minWidth: SCREEN_CHROME_HEADER_LAYOUT_METRICS.slotSize,
        minHeight: SCREEN_CHROME_HEADER_LAYOUT_METRICS.slotSize,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1,
    },
});
