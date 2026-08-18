import type { EdgeFadePosition } from './edge-fade-position.type';
import type { EdgeFadeScrollAnimationInterface } from './edge-fade-scroll-animation.interface';
import type { BlurMethod } from 'expo-blur';
import type { ViewProps } from 'react-native';

/**
 * Configures a decorative top or bottom blur-and-wash band.
 * @see https://github.com/rnw-community/rnw-community/tree/master/packages/react-native-screen-chrome#edgefadepropsinterface
 */
export interface EdgeFadePropsInterface extends Omit<ViewProps, 'children'> {
    readonly position: EdgeFadePosition;
    readonly height?: number;
    readonly intensity?: number;
    readonly scrollAnimation?: EdgeFadeScrollAnimationInterface;
    readonly blurMethod?: BlurMethod;
}
