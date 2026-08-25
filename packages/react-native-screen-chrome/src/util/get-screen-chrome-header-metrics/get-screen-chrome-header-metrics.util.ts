const NO_EXTRA_TOP_INSET = 0;

/**
 * Computes the rendered header footprint from header heights and the device top inset, matching the rendered containers.
 * @see https://github.com/rnw-community/rnw-community/tree/master/packages/react-native-screen-chrome#getscreenchromeheadermetrics
 */
export const getScreenChromeHeaderMetrics = (
    headerHeight: number,
    insetsTop: number,
    headerTopInset = NO_EXTRA_TOP_INSET
): number => insetsTop + headerTopInset + headerHeight;
