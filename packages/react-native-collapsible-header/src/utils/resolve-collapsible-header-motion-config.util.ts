import { DefaultCollapsibleHeaderMotionConfig } from '../constant/default-collapsible-header-motion-config.constant.js';

import type { CollapsibleHeaderMotionConfig } from '../interface/collapsible-header-motion-config.interface.js';

export const resolveCollapsibleHeaderMotionConfig = (
    motion: Partial<CollapsibleHeaderMotionConfig> | undefined
): CollapsibleHeaderMotionConfig => ({
    ...DefaultCollapsibleHeaderMotionConfig,
    ...motion,
});
