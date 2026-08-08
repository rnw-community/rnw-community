import { DefaultCollapsibleHeaderMotionConfig } from './default-collapsible-header-motion.config.js';

import type { CollapsibleHeaderMotionConfig } from '../interface/collapsible-header-motion-config.interface.js';

export const resolveCollapsibleHeaderMotionConfig = (
    motion: Partial<CollapsibleHeaderMotionConfig> | undefined
): CollapsibleHeaderMotionConfig => ({
    expandedOpacityEndProgress:
        motion?.expandedOpacityEndProgress ?? DefaultCollapsibleHeaderMotionConfig.expandedOpacityEndProgress,
    collapsedOpacityStartProgress:
        motion?.collapsedOpacityStartProgress ?? DefaultCollapsibleHeaderMotionConfig.collapsedOpacityStartProgress,
    backgroundOpacityStartProgress:
        motion?.backgroundOpacityStartProgress ?? DefaultCollapsibleHeaderMotionConfig.backgroundOpacityStartProgress,
    pointerEventsSwitchProgress:
        motion?.pointerEventsSwitchProgress ?? DefaultCollapsibleHeaderMotionConfig.pointerEventsSwitchProgress,
    expandedTranslateY: motion?.expandedTranslateY ?? DefaultCollapsibleHeaderMotionConfig.expandedTranslateY,
    expandedScale: motion?.expandedScale ?? DefaultCollapsibleHeaderMotionConfig.expandedScale,
    collapsedTranslateY: motion?.collapsedTranslateY ?? DefaultCollapsibleHeaderMotionConfig.collapsedTranslateY,
});
