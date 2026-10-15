import type { ScreenChromeHeaderLayoutMetricsInterface } from '../interface/screen-chrome-header-layout-metrics.interface';

/**
 * Exposes the header row padding, slot size and title inset so custom title layouts stay aligned with the header.
 * @see https://github.com/rnw-community/rnw-community/tree/master/packages/react-native-screen-chrome#screen_chrome_header_layout_metrics
 */
export const SCREEN_CHROME_HEADER_LAYOUT_METRICS: ScreenChromeHeaderLayoutMetricsInterface = {
    rowPadding: 16,
    slotSize: 44,
    titleInset: 72,
};
