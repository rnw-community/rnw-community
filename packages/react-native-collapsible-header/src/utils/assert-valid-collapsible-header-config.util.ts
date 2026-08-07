import { isPositiveNumber } from '@rnw-community/shared';

import type { CollapsibleHeaderMotionConfig } from '../interface/collapsible-header-motion-config.interface.js';
import type { CollapsibleHeaderProps } from '../interface/collapsible-header-props.interface.js';

type CollapsibleHeaderGeometry = Required<
    Pick<CollapsibleHeaderProps, 'expandedHeight' | 'collapsedHeight' | 'collapseDistance' | 'collapseStart'>
>;

const assertProgress = (field: keyof CollapsibleHeaderMotionConfig, value: number) => {
    if (!Number.isFinite(value) || value < 0 || value > 1) {
        throw new Error(`${field} must be between zero and one`);
    }
};

const assertFiniteNumber = (field: keyof CollapsibleHeaderMotionConfig, value: number) => {
    if (!Number.isFinite(value)) {
        throw new Error(`${field} must be a finite number`);
    }
};

const assertValidGeometry = (geometry: CollapsibleHeaderGeometry) => {
    if (!isPositiveNumber(geometry.expandedHeight)) {
        throw new Error('expandedHeight must be greater than zero');
    }
    if (!isPositiveNumber(geometry.collapsedHeight)) {
        throw new Error('collapsedHeight must be greater than zero');
    }
    if (!isPositiveNumber(geometry.collapseDistance)) {
        throw new Error('collapseDistance must be greater than zero');
    }
    if (!Number.isFinite(geometry.collapseStart) || geometry.collapseStart < 0) {
        throw new Error('collapseStart must be greater than or equal to zero');
    }
    if (geometry.expandedHeight < geometry.collapsedHeight) {
        throw new Error('expandedHeight must be greater than or equal to collapsedHeight');
    }
};

const assertValidMotionConfig = (motion: CollapsibleHeaderMotionConfig) => {
    assertProgress('expandedOpacityEndProgress', motion.expandedOpacityEndProgress);
    assertProgress('collapsedOpacityStartProgress', motion.collapsedOpacityStartProgress);
    assertProgress('backgroundOpacityStartProgress', motion.backgroundOpacityStartProgress);
    assertProgress('pointerEventsSwitchProgress', motion.pointerEventsSwitchProgress);
    assertFiniteNumber('expandedTranslateY', motion.expandedTranslateY);
    assertFiniteNumber('collapsedTranslateY', motion.collapsedTranslateY);
    if (!Number.isFinite(motion.expandedScale) || !isPositiveNumber(motion.expandedScale)) {
        throw new Error('expandedScale must be a finite number greater than zero');
    }
    if (motion.collapsedOpacityStartProgress > motion.expandedOpacityEndProgress) {
        throw new Error('collapsedOpacityStartProgress must be less than or equal to expandedOpacityEndProgress');
    }
};

export const assertValidCollapsibleHeaderConfig = (
    geometry: CollapsibleHeaderGeometry,
    motion: CollapsibleHeaderMotionConfig
) => {
    assertValidGeometry(geometry);
    assertValidMotionConfig(motion);
};
