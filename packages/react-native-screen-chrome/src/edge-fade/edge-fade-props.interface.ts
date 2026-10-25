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
     * Accepted for compatibility and ignored: the blur holds its full radius only over the outermost 8% of the band and
     * eases in across the rest of it, whatever chrome sits on top. Deprecated: remove this prop.
     */
    readonly chromeHeight?: number;
    /** Static blur intensity, ignored while `scrollAnimation` drives it. @defaultValue the provider config's `intensity` */
    readonly intensity?: number;
    /** Scroll-driven opacity and blur-intensity ranges; the blur radius stays static and `intensityInputRange` fades it in. */
    readonly scrollAnimation?: EdgeFadeScrollAnimationInterface;
    /** Custom band content renderer. @defaultValue the provider's `renderEdgeFadeBand`, else the package's default band */
    readonly renderBand?: EdgeFadeBandRenderer;
}
