/**
 * Configures scroll-driven edge-fade opacity and blur intensity.
 * @see https://github.com/rnw-community/rnw-community/tree/master/packages/react-native-screen-chrome#edgefadescrollanimationinterface
 */
export interface EdgeFadeScrollAnimationInterface {
    /** Scroll offsets the band fades in across, on every platform. */
    readonly opacityInputRange?: readonly [number, number];
    /** Scroll offsets the blur intensity ramps across; native only, because web applies a static backdrop blur. */
    readonly intensityInputRange?: readonly [number, number];
    /** Blur intensity reached at the end of `intensityInputRange`; native only. @defaultValue the provider config's `maxBlurIntensity` */
    readonly maxIntensity?: number;
}
