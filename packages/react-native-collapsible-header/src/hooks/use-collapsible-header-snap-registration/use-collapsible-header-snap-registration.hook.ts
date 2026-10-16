import { useEffect } from 'react';

import { emptyFn, isDefined } from '@rnw-community/shared';

import { assertVacantCollapsibleHeaderSnapSlot } from '../../assert/assert-vacant-collapsible-header-snap-slot.assert';

import type { CollapsibleHeaderScrollContextValue } from '../../interface/collapsible-header-scroll-context-value.interface';
import type { CollapsibleHeaderSnapConfig } from '../../interface/collapsible-header-snap-config.interface';
import type { EmptyFn, Maybe } from '@rnw-community/shared';

const claimSnapSlot = (
    { snapConfig, snapOwnerCount }: CollapsibleHeaderScrollContextValue,
    ownedSnapConfig: CollapsibleHeaderSnapConfig
): EmptyFn => {
    assertVacantCollapsibleHeaderSnapSlot(snapConfig.get(), ownedSnapConfig);
    if (snapOwnerCount.current === 0) {
        snapConfig.set(ownedSnapConfig);
    }
    snapOwnerCount.current += 1;

    return () => {
        snapOwnerCount.current -= 1;
        if (snapOwnerCount.current === 0) {
            snapConfig.set(null);
        }
    };
};

export const useCollapsibleHeaderSnapRegistration = (
    scrollContext: Maybe<CollapsibleHeaderScrollContextValue>,
    snap: boolean,
    snapStart: number,
    snapEnd: number
): void => {
    useEffect(() => {
        if (!snap || !isDefined(scrollContext)) {
            return emptyFn;
        }

        return claimSnapSlot(scrollContext, { snapEnd, snapStart });
    }, [scrollContext, snap, snapStart, snapEnd]);
};
