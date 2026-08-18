import { useEffect } from 'react';

import { emptyFn, isDefined } from '@rnw-community/shared';

import { assertVacantCollapsibleHeaderSnapSlot } from '../assert/assert-vacant-collapsible-header-snap-slot.assert';

import type { CollapsibleHeaderScrollContextValue } from '../interface/collapsible-header-scroll-context-value.interface';
import type { Maybe } from '@rnw-community/shared';

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
        const ownedSnapConfig = { snapEnd, snapStart };
        assertVacantCollapsibleHeaderSnapSlot(scrollContext.snapConfig.get(), ownedSnapConfig);
        scrollContext.snapConfig.set(ownedSnapConfig);

        return () => {
            if (scrollContext.snapConfig.get() === ownedSnapConfig) {
                scrollContext.snapConfig.set(null);
            }
        };
    }, [scrollContext, snap, snapStart, snapEnd]);
};
