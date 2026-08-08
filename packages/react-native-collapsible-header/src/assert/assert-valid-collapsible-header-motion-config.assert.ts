import { isPositiveNumber } from '@rnw-community/shared';

import { assertCollapsibleHeaderProgress } from './assert-collapsible-header-progress.assert.js';
import { assertFiniteCollapsibleHeaderMotionValue } from './assert-finite-collapsible-header-motion-value.assert.js';

import type { CollapsibleHeaderMotionConfig } from '../interface/collapsible-header-motion-config.interface.js';

export const assertValidCollapsibleHeaderMotionConfig = (motion: CollapsibleHeaderMotionConfig) => {
    assertCollapsibleHeaderProgress('expandedOpacityEndProgress', motion.expandedOpacityEndProgress);
    assertCollapsibleHeaderProgress('collapsedOpacityStartProgress', motion.collapsedOpacityStartProgress);
    assertCollapsibleHeaderProgress('backgroundOpacityStartProgress', motion.backgroundOpacityStartProgress);
    assertCollapsibleHeaderProgress('pointerEventsSwitchProgress', motion.pointerEventsSwitchProgress);
    assertFiniteCollapsibleHeaderMotionValue('expandedTranslateY', motion.expandedTranslateY);
    assertFiniteCollapsibleHeaderMotionValue('collapsedTranslateY', motion.collapsedTranslateY);
    if (!Number.isFinite(motion.expandedScale) || !isPositiveNumber(motion.expandedScale)) {
        throw new Error('expandedScale must be a finite number greater than zero');
    }
    if (motion.collapsedOpacityStartProgress > motion.expandedOpacityEndProgress) {
        throw new Error('collapsedOpacityStartProgress must be less than or equal to expandedOpacityEndProgress');
    }
};
