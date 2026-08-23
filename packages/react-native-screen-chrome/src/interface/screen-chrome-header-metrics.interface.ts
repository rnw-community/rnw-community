/**
 * Describes the rendered header footprint so consumers can offset content without re-merging config.
 * @see https://github.com/rnw-community/rnw-community/tree/master/packages/react-native-screen-chrome#screenchromeheadermetricsinterface
 */
export interface ScreenChromeHeaderMetricsInterface {
    readonly headerTotalHeight: number;
    readonly recommendedContentTopGap: number;
}
