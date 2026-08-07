/**
 * Configures the progress thresholds and transforms used by collapsible header transition layers.
 * @see https://github.com/rnw-community/rnw-community/tree/master/packages/react-native-collapsible-header#collapsibleheadermotionconfig
 */
export interface CollapsibleHeaderMotionConfig {
    readonly expandedOpacityEndProgress: number;
    readonly collapsedOpacityStartProgress: number;
    readonly backgroundOpacityStartProgress: number;
    readonly pointerEventsSwitchProgress: number;
    readonly expandedTranslateY: number;
    readonly expandedScale: number;
    readonly collapsedTranslateY: number;
}
