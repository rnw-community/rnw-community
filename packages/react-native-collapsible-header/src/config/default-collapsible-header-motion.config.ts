import type { CollapsibleHeaderMotionConfig } from '../interface/collapsible-header-motion-config.interface';

export const DefaultCollapsibleHeaderMotionConfig: CollapsibleHeaderMotionConfig = {
    expandedOpacityEndProgress: 0.6,
    collapsedOpacityStartProgress: 0.5,
    backgroundOpacityStartProgress: 0.7,
    pointerEventsSwitchProgress: 0.5,
    expandedTranslateY: -20,
    expandedScale: 0.9,
    collapsedTranslateY: 10,
};
