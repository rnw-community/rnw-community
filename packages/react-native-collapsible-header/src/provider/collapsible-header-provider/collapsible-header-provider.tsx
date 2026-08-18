import React from 'react';
import { useAnimatedRef, useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated';

import { CollapsibleHeaderScrollContext } from '../../context/collapsible-header-scroll.context';
import { createCollapsibleHeaderScrollWorklets } from '../../util/create-collapsible-header-scroll-worklets/create-collapsible-header-scroll-worklets';

import type { CollapsibleHeaderSnapConfig } from '../../interface/collapsible-header-snap-config.interface';
import type { Maybe } from '@rnw-community/shared';
import type { PropsWithChildren, ReactElement } from 'react';
import type Animated from 'react-native-reanimated';

/**
 * Owns the scroll wiring so descendant headers and scrollables connect without manual plumbing.
 * @see https://github.com/rnw-community/rnw-community/tree/master/packages/react-native-collapsible-header#collapsibleheaderprovider
 */
export const CollapsibleHeaderProvider = ({ children }: PropsWithChildren): ReactElement => {
    const scrollY = useSharedValue(0);
    const scrollRef = useAnimatedRef<Animated.ScrollView>();
    const snapConfig = useSharedValue<Maybe<CollapsibleHeaderSnapConfig>>(null);
    const snapSettleGeneration = useSharedValue(0);
    const onScroll = useAnimatedScrollHandler(
        createCollapsibleHeaderScrollWorklets(scrollY, scrollRef, snapConfig, snapSettleGeneration)
    );

    return (
        <CollapsibleHeaderScrollContext.Provider value={{ onScroll, scrollRef, scrollY, snapConfig }}>
            {children}
        </CollapsibleHeaderScrollContext.Provider>
    );
};
