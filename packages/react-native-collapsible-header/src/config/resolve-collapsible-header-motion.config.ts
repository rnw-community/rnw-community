import { DefaultCollapsibleHeaderMotionConfig } from './default-collapsible-header-motion.config';

import type { CollapsibleHeaderMotionConfig } from '../interface/collapsible-header-motion-config.interface';

export const resolveCollapsibleHeaderMotionConfig = (
    motion: Partial<CollapsibleHeaderMotionConfig> | undefined
): CollapsibleHeaderMotionConfig => {
    const expandedOpacityEndProgress =
        motion?.expandedOpacityEndProgress ?? DefaultCollapsibleHeaderMotionConfig.expandedOpacityEndProgress;
    const collapsedOpacityStartProgress =
        motion?.collapsedOpacityStartProgress ?? DefaultCollapsibleHeaderMotionConfig.collapsedOpacityStartProgress;

    return {
        expandedOpacityEndProgress,
        collapsedOpacityStartProgress,
        backgroundOpacityStartProgress:
            motion?.backgroundOpacityStartProgress ?? DefaultCollapsibleHeaderMotionConfig.backgroundOpacityStartProgress,
        pointerEventsSwitchProgress:
            motion?.pointerEventsSwitchProgress ?? (collapsedOpacityStartProgress + expandedOpacityEndProgress) / 2,
        expandedTranslateY: motion?.expandedTranslateY ?? DefaultCollapsibleHeaderMotionConfig.expandedTranslateY,
        expandedScale: motion?.expandedScale ?? DefaultCollapsibleHeaderMotionConfig.expandedScale,
        collapsedTranslateY: motion?.collapsedTranslateY ?? DefaultCollapsibleHeaderMotionConfig.collapsedTranslateY,
    };
};
