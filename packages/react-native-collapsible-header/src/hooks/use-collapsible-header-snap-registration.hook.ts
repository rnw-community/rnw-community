import { useEffect } from 'react';

import { emptyFn, isDefined } from '@rnw-community/shared';

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
        scrollContext.snapConfig.set({ snapEnd, snapStart });

        return () => void scrollContext.snapConfig.set(null);
    }, [scrollContext, snap, snapStart, snapEnd]);
};
