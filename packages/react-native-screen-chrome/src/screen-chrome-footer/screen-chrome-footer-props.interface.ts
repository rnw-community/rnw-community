import type { EdgeFadePropsInterface } from '../edge-fade/edge-fade-props.interface';
import type { ReactNode } from 'react';
import type { StyleProp, ViewProps, ViewStyle } from 'react-native';

/**
 * Configures the bottom-pinned footer that paints a bottom edge fade and publishes its measured height.
 * @see https://github.com/rnw-community/rnw-community/tree/master/packages/react-native-screen-chrome#screenchromefooterpropsinterface
 */
export interface ScreenChromeFooterPropsInterface extends Omit<ViewProps, 'children' | 'pointerEvents'> {
    /** Consumer-owned footer content, rendered above the fade band. */
    readonly children: ReactNode;
    /** Style of the measured content node, for max-width caps, alignment, and padding. */
    readonly contentStyle?: StyleProp<ViewStyle>;
    /** Props forwarded to the bottom `EdgeFade` band painted behind the content. */
    readonly edgeFadeProps?: Omit<EdgeFadePropsInterface, 'position'>;
}
