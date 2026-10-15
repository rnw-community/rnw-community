/**
 * Describes the horizontal layout metrics the compound collapsible header uses for its row, slots and title layers.
 * @see https://github.com/rnw-community/rnw-community/tree/master/packages/react-native-screen-chrome#screenchromeheaderlayoutmetricsinterface
 */
export interface ScreenChromeHeaderLayoutMetricsInterface {
    /** Horizontal padding of the persistent leading/trailing row. */
    readonly rowPadding: number;
    /** Minimum width and height of a leading or trailing slot. */
    readonly slotSize: number;
    /** Horizontal inset of the centered title layers. */
    readonly titleInset: number;
}
