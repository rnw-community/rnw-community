/**
 * Configures the progress thresholds and transforms used by collapsible header transition layers.
 * @see https://github.com/rnw-community/rnw-community/tree/master/packages/react-native-collapsible-header#collapsibleheadermotionconfig
 */
export interface CollapsibleHeaderMotionConfig {
    /**
     * Progress where expanded content finishes fading from opacity `1` to `0`.
     * @defaultValue `0.6`
     */
    readonly expandedOpacityEndProgress: number;
    /**
     * Progress where collapsed content begins fading from opacity `0` to `1`.
     * @defaultValue `0.5`
     */
    readonly collapsedOpacityStartProgress: number;
    /**
     * Progress where the background begins fading from opacity `0` to `1`.
     * @defaultValue `0.7`
     */
    readonly backgroundOpacityStartProgress: number;
    /**
     * Progress where pointer events and accessibility focus move from expanded to collapsed content.
     * @defaultValue `0.5`
     */
    readonly pointerEventsSwitchProgress: number;
    /**
     * Expanded content translateY at the collapsed endpoint.
     * @defaultValue `-20`
     */
    readonly expandedTranslateY: number;
    /**
     * Expanded content scale at the collapsed endpoint; must be greater than `0`.
     * @defaultValue `0.9`
     */
    readonly expandedScale: number;
    /**
     * Collapsed content translateY at the fade-in start endpoint.
     * @defaultValue `10`
     */
    readonly collapsedTranslateY: number;
}
