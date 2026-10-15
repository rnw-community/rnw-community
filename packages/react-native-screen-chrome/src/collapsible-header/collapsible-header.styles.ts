import { StyleSheet } from 'react-native';

import { SCREEN_CHROME_HEADER_LAYOUT_METRICS } from '../constant/screen-chrome-header-layout-metrics.constant';

export const collapsibleHeaderStyles = StyleSheet.create({
    container: {
        zIndex: 3,
    },
    persistentRow: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: SCREEN_CHROME_HEADER_LAYOUT_METRICS.rowPadding,
        width: '100%',
    },
    titleLayer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: SCREEN_CHROME_HEADER_LAYOUT_METRICS.titleInset,
    },
    expandedTitleLayer: {
        justifyContent: 'center',
    },
});
