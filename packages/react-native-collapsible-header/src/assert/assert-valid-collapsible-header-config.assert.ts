import { assertValidCollapsibleHeaderGeometry } from './assert-valid-collapsible-header-geometry.assert.js';
import { assertValidCollapsibleHeaderMotionConfig } from './assert-valid-collapsible-header-motion-config.assert.js';

import type { CollapsibleHeaderMotionConfig } from '../interface/collapsible-header-motion-config.interface.js';
import type { CollapsibleHeaderGeometry } from '../type/collapsible-header-geometry.type.js';

export const assertValidCollapsibleHeaderConfig = (
    geometry: CollapsibleHeaderGeometry,
    motion: CollapsibleHeaderMotionConfig
) => {
    assertValidCollapsibleHeaderGeometry(geometry);
    assertValidCollapsibleHeaderMotionConfig(motion);
};
