/**
 * Configures scroll-driven edge-fade opacity and blur intensity.
 * @see https://github.com/rnw-community/rnw-community/tree/master/packages/react-native-screen-chrome#edgefadescrollanimationinterface
 */
export interface EdgeFadeScrollAnimationInterface {
    readonly opacityInputRange?: readonly [number, number];
    readonly intensityInputRange?: readonly [number, number];
    readonly maxIntensity?: number;
}
