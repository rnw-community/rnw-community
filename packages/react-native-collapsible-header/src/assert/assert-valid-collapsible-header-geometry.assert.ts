import { isPositiveNumber } from '@rnw-community/shared';

export const assertValidCollapsibleHeaderGeometry = (
    expandedHeight: number,
    collapsedHeight: number,
    collapseDistance: number,
    collapseStart: number
) => {
    if (!Number.isFinite(expandedHeight) || !isPositiveNumber(expandedHeight)) {
        throw new Error('expandedHeight must be a finite number greater than zero');
    }
    if (!Number.isFinite(collapsedHeight) || !isPositiveNumber(collapsedHeight)) {
        throw new Error('collapsedHeight must be a finite number greater than zero');
    }
    if (!Number.isFinite(collapseDistance) || !isPositiveNumber(collapseDistance)) {
        throw new Error('collapseDistance must be a finite number greater than zero');
    }
    if (!Number.isFinite(collapseStart) || collapseStart < 0) {
        throw new Error('collapseStart must be a finite number greater than or equal to zero');
    }
    if (expandedHeight < collapsedHeight) {
        throw new Error('expandedHeight must be greater than or equal to collapsedHeight');
    }
};
