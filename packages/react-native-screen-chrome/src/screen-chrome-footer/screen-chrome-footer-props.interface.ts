import type { EdgeFadePropsInterface } from '../edge-fade/edge-fade-props.interface';
import type { ReactNode } from 'react';
import type { StyleProp, ViewProps, ViewStyle } from 'react-native';

/**
 * Configures the bottom-pinned footer that paints a bottom edge fade and publishes its measured height.
 * @see https://github.com/rnw-community/rnw-community/tree/master/packages/react-native-screen-chrome#screenchromefooterpropsinterface
 */
export interface ScreenChromeFooterPropsInterface extends Omit<ViewProps, 'children' | 'pointerEvents'> {
    /** Distance from the bottom edge, the footprint of the bottom chrome this footer stacks above; added to the published height. @defaultValue `0` */
    readonly bottomOffset?: number;
    /** Consumer-owned footer content, rendered above the fade band. */
    readonly children: ReactNode;
    /** Style of the measured content node, for max-width caps, alignment, and padding. */
    readonly contentStyle?: StyleProp<ViewStyle>;
    /** Props forwarded to the bottom `EdgeFade` band painted behind the content. */
    readonly edgeFadeProps?: Omit<EdgeFadePropsInterface, 'position'>;
    /** Whether the container pads the safe-area bottom, `false` when stacked above chrome that already pads it. @defaultValue `true` */
    readonly includeBottomSafeArea?: boolean;
}
