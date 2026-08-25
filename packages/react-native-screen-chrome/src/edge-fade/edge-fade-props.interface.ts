import type { EdgeFadePosition } from './edge-fade-position.type';
import type { EdgeFadeScrollAnimationInterface } from './edge-fade-scroll-animation.interface';
import type { BlurMethod } from 'expo-blur';
import type { RefObject } from 'react';
import type { View, ViewProps } from 'react-native';

/**
 * Configures a decorative top or bottom blur-and-wash band.
 * @see https://github.com/rnw-community/rnw-community/tree/master/packages/react-native-screen-chrome#edgefadepropsinterface
 */
export interface EdgeFadePropsInterface extends Omit<ViewProps, 'children'> {
    /** Screen edge the band renders at. */
    readonly position: EdgeFadePosition;
    /** Band height in points. @defaultValue the provider config's fade height for the position */
    readonly height?: number;
    /** Static blur intensity, ignored while `scrollAnimation` drives it. @defaultValue the provider config's `intensity` */
    readonly intensity?: number;
    /** Scroll-driven opacity and blur-intensity ranges; on web only opacity animates and the blur stays static. */
    readonly scrollAnimation?: EdgeFadeScrollAnimationInterface;
    /** Android Expo Blur rendering method. @defaultValue `'dimezisBlurView'` when `blurTarget` is set, otherwise `'none'` */
    readonly blurMethod?: BlurMethod;
    /** Ref to the Android `BlurTargetView` whose background the band blurs; required by `dimezisBlurView` methods. */
    readonly blurTarget?: RefObject<View | null>;
}
