/**
 * Describes the space bottom chrome occupies, as returned by `useBottomChromeInset`.
 * @see https://github.com/rnw-community/rnw-community/tree/master/packages/react-native-screen-chrome#bottomchromeinsetinterface
 */
export interface BottomChromeInsetInterface {
    /** Measured bottom chrome height without the safe area, the value `ScreenChromeScrollView`'s `contentInsetBottom` expects. */
    readonly chromeHeight: number;
    /** Full bottom footprint, `chromeHeight` plus the safe-area bottom inset, for surfaces that do not add the safe area. */
    readonly inset: number;
}
