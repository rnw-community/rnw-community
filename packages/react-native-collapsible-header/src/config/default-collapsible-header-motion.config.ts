import type { CollapsibleHeaderMotionConfig } from '../interface/collapsible-header-motion-config.interface';

/**
 * Baseline motion preset applied when partial `motion` overrides omit fields, except the derived pointer-events switch.
 * @see https://github.com/rnw-community/rnw-community/tree/master/packages/react-native-collapsible-header#defaultcollapsibleheadermotionconfig
 */
export const DefaultCollapsibleHeaderMotionConfig: CollapsibleHeaderMotionConfig = {
    expandedOpacityEndProgress: 0.6,
    collapsedOpacityStartProgress: 0.5,
    backgroundOpacityStartProgress: 0.7,
    pointerEventsSwitchProgress: 0.5,
    expandedTranslateY: -20,
    expandedScale: 0.9,
    collapsedTranslateY: 10,
};
