/**
 * Configures `useBottomChromeHeightPublisher`, switching it from measuring a view to reserving a declared height.
 * @see https://github.com/rnw-community/rnw-community/tree/master/packages/react-native-screen-chrome#bottomchromeheightpublisheroptionsinterface
 */
export interface BottomChromeHeightPublisherOptionsInterface {
    /** Declared height, without the safe area, reserved while the publisher is mounted instead of the measured one. */
    readonly height?: number;
}
