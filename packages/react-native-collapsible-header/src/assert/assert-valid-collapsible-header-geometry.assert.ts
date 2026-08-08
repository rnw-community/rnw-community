import { isPositiveNumber } from '@rnw-community/shared';

import type { CollapsibleHeaderGeometry } from '../type/collapsible-header-geometry.type.js';

export const assertValidCollapsibleHeaderGeometry = (geometry: CollapsibleHeaderGeometry) => {
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
        throw new Error('collapseStart must be a finite number greater than or equal to zero');
    }
    if (geometry.expandedHeight < geometry.collapsedHeight) {
        throw new Error('expandedHeight must be greater than or equal to collapsedHeight');
    }
};
