import type { EdgeFadePropsInterface } from '../edge-fade/edge-fade-props.interface';

/**
 * Configures the top edge fade a `CollapsibleHeaderBackdrop` renders, forwarding every `EdgeFade` prop except `position`.
 * @see https://github.com/rnw-community/rnw-community/tree/master/packages/react-native-screen-chrome#collapsibleheaderbackdroppropsinterface
 */
export interface CollapsibleHeaderBackdropPropsInterface extends Omit<EdgeFadePropsInterface, 'position'> {
    /** Band height in points. @defaultValue the provider config's `headerBackdropHeight` */
    readonly height?: number;
    /** Height of the header chrome the blur holds full strength behind. @defaultValue the provider config's `headerHeight` */
    readonly chromeHeight?: number;
    /** Scroll-driven opacity and blur-intensity ranges. @defaultValue opacity over `collapseStart`–`smallTitleStart`, intensity over `collapseStart`–`collapseEnd` */
    readonly scrollAnimation?: EdgeFadePropsInterface['scrollAnimation'];
}
