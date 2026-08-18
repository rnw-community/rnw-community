import type { CollapsibleHeaderMotionConfig } from '../interface/collapsible-header-motion-config.interface';

export const assertCollapsibleHeaderProgress = (field: keyof CollapsibleHeaderMotionConfig, value: number) => {
    if (!Number.isFinite(value) || value < 0 || value > 1) {
        throw new Error(`${field} must be between zero and one`);
    }
};
