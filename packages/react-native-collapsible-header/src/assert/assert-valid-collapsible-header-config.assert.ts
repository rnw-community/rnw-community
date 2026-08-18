import { assertValidCollapsibleHeaderGeometry } from './assert-valid-collapsible-header-geometry.assert';
import { assertValidCollapsibleHeaderMotionConfig } from './assert-valid-collapsible-header-motion-config.assert';

import type { CollapsibleHeaderMotionConfig } from '../interface/collapsible-header-motion-config.interface';
import type { CollapsibleHeaderGeometry } from '../type/collapsible-header-geometry.type';

export const assertValidCollapsibleHeaderConfig = (
    geometry: CollapsibleHeaderGeometry,
    motion: CollapsibleHeaderMotionConfig
) => {
    assertValidCollapsibleHeaderGeometry(geometry);
    assertValidCollapsibleHeaderMotionConfig(motion);
};
