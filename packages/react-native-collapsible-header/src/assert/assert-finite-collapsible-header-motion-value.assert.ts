import type { CollapsibleHeaderMotionConfig } from '../interface/collapsible-header-motion-config.interface';

export const assertFiniteCollapsibleHeaderMotionValue = (field: keyof CollapsibleHeaderMotionConfig, value: number) => {
    if (!Number.isFinite(value)) {
        throw new Error(`${field} must be a finite number`);
    }
};
