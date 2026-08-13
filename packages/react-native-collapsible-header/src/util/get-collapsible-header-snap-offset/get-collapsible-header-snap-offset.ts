import type { CollapsibleHeaderSnapConfig } from '../../interface/collapsible-header-snap-config.interface';
import type { Maybe } from '@rnw-community/shared';

export const getCollapsibleHeaderSnapOffset = (
    offsetY: number,
    snapConfig: Maybe<CollapsibleHeaderSnapConfig>
): Maybe<number> => {
    'worklet';

    if (snapConfig === null) {
        return null;
    }
    if (offsetY <= snapConfig.snapStart || offsetY >= snapConfig.snapEnd) {
        return null;
    }
    const snapMidpoint = snapConfig.snapStart + (snapConfig.snapEnd - snapConfig.snapStart) / 2;

    return offsetY < snapMidpoint ? snapConfig.snapStart : snapConfig.snapEnd;
};
