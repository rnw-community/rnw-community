import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getScreenChromeHeaderMetrics } from '../../util/get-screen-chrome-header-metrics/get-screen-chrome-header-metrics.util';
import { useScreenChrome } from '../use-screen-chrome/use-screen-chrome.hook';

import type { ScreenChromeHeaderMetricsInterface } from '../../interface/screen-chrome-header-metrics.interface';

/**
 * Returns the rendered header footprint so screens can offset content without re-merging the default config.
 * @see https://github.com/rnw-community/rnw-community/tree/master/packages/react-native-screen-chrome#usescreenchromeheadermetrics
 */
export const useScreenChromeHeaderMetrics = (): ScreenChromeHeaderMetricsInterface => {
    const { config } = useScreenChrome();
    const insets = useSafeAreaInsets();

    return getScreenChromeHeaderMetrics(config.headerHeight, insets.top);
};
