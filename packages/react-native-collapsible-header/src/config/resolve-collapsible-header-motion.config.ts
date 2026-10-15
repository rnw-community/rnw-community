import { DefaultCollapsibleHeaderMotionConfig } from './default-collapsible-header-motion.config';

import type { CollapsibleHeaderMotionConfig } from '../interface/collapsible-header-motion-config.interface';
import type { CollapsibleHeaderCollapsedTransition } from '../type/collapsible-header-collapsed-transition.type';

export const resolveCollapsibleHeaderMotionConfig = (
    motion: Partial<CollapsibleHeaderMotionConfig> | undefined,
    collapsedTransition: CollapsibleHeaderCollapsedTransition,
    collapsedHeight: number
): CollapsibleHeaderMotionConfig => {
    const expandedOpacityEndProgress =
        motion?.expandedOpacityEndProgress ?? DefaultCollapsibleHeaderMotionConfig.expandedOpacityEndProgress;
    const collapsedOpacityStartProgress =
        motion?.collapsedOpacityStartProgress ?? DefaultCollapsibleHeaderMotionConfig.collapsedOpacityStartProgress;
    const transitionCollapsedTranslateY =
        collapsedTransition === 'roll' ? collapsedHeight : DefaultCollapsibleHeaderMotionConfig.collapsedTranslateY;

    return {
        expandedOpacityEndProgress,
        collapsedOpacityStartProgress,
        backgroundOpacityStartProgress:
            motion?.backgroundOpacityStartProgress ?? DefaultCollapsibleHeaderMotionConfig.backgroundOpacityStartProgress,
        pointerEventsSwitchProgress:
            motion?.pointerEventsSwitchProgress ?? (collapsedOpacityStartProgress + expandedOpacityEndProgress) / 2,
        expandedTranslateY: motion?.expandedTranslateY ?? DefaultCollapsibleHeaderMotionConfig.expandedTranslateY,
        expandedScale: motion?.expandedScale ?? DefaultCollapsibleHeaderMotionConfig.expandedScale,
        collapsedTranslateY: motion?.collapsedTranslateY ?? transitionCollapsedTranslateY,
    };
};
