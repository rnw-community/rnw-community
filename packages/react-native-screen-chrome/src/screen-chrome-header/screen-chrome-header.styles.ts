import { StyleSheet } from 'react-native';

import { SCREEN_CHROME_HEADER_LAYOUT_METRICS } from '../constant/screen-chrome-header-layout-metrics.constant';

export const screenChromeHeaderStyles = StyleSheet.create({
    container: {
        left: 0,
        position: 'absolute',
        right: 0,
        top: 0,
        zIndex: 3,
    },
    row: {
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
        overflow: 'hidden',
        paddingHorizontal: SCREEN_CHROME_HEADER_LAYOUT_METRICS.rowPadding,
        width: '100%',
    },
});
