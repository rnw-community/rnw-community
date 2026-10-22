import type { EdgeFadeBandRenderer } from './edge-fade-band-renderer.type';
import type { EdgeFadePosition } from './edge-fade-position.type';
import type { EdgeFadeScrollAnimationInterface } from './edge-fade-scroll-animation.interface';
import type { ViewProps } from 'react-native';

/**
 * Configures a decorative top or bottom blur-and-wash band.
 * @see https://github.com/rnw-community/rnw-community/tree/master/packages/react-native-screen-chrome#edgefadepropsinterface
 */
export interface EdgeFadePropsInterface extends Omit<ViewProps, 'children'> {
    /** Screen edge the band renders at. */
    readonly position: EdgeFadePosition;
    /** Band height in points. @defaultValue the provider config's fade height for the position */
    readonly height?: number;
    /**
     * Height in points of the chrome the band sits behind, beyond the safe-area inset. The blur holds its full radius
     * over the inset plus this height and eases to zero across the rest of the band.
     * @defaultValue 0
     */
    readonly chromeHeight?: number;
    /** Static blur intensity, ignored while `scrollAnimation` drives it. @defaultValue the provider config's `intensity` */
    readonly intensity?: number;
    /** Scroll-driven opacity and blur-intensity ranges; the blur radius stays static and `intensityInputRange` fades it in. */
    readonly scrollAnimation?: EdgeFadeScrollAnimationInterface;
    /** Custom band content renderer. @defaultValue the provider's `renderEdgeFadeBand`, else the package's default band */
    readonly renderBand?: EdgeFadeBandRenderer;
}
