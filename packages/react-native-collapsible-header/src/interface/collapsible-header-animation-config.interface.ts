import type { CollapsibleHeaderMotionConfig } from './collapsible-header-motion-config.interface.js';
import type { CollapsibleHeaderProps } from './collapsible-header-props.interface.js';

export interface CollapsibleHeaderAnimationConfig {
    readonly scrollY: CollapsibleHeaderProps['scrollY'];
    readonly expandedHeight: number;
    readonly collapsedHeight: number;
    readonly collapseStart: number;
    readonly collapseDistance: number;
    readonly motionConfig: CollapsibleHeaderMotionConfig;
}
