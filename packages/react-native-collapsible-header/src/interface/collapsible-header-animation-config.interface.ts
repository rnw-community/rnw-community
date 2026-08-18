import type { CollapsibleHeaderMotionConfig } from './collapsible-header-motion-config.interface';
import type { SharedValue } from 'react-native-reanimated';

export interface CollapsibleHeaderAnimationConfig {
    readonly scrollY: SharedValue<number>;
    readonly expandedHeight: number;
    readonly collapsedHeight: number;
    readonly collapseStart: number;
    readonly collapseDistance: number;
    readonly motionConfig: CollapsibleHeaderMotionConfig;
    readonly stretchOnOverscroll: boolean;
}
