import { isDefined } from '@rnw-community/shared';

import type { CollapsibleHeaderSnapConfig } from '../interface/collapsible-header-snap-config.interface';
import type { Maybe } from '@rnw-community/shared';

export const assertVacantCollapsibleHeaderSnapSlot = (
    registeredSnapConfig: Maybe<CollapsibleHeaderSnapConfig>,
    snapConfig: CollapsibleHeaderSnapConfig
) => {
    const conflicts =
        isDefined(registeredSnapConfig) &&
        (registeredSnapConfig.snapStart !== snapConfig.snapStart || registeredSnapConfig.snapEnd !== snapConfig.snapEnd);

    if (conflicts) {
        throw new Error(
            'CollapsibleHeader snap is already registered with different geometry: a CollapsibleHeaderProvider wires one scrollable, so only one snapping header may claim it'
        );
    }
};
