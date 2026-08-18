import React from 'react';
import { useAnimatedRef, useAnimatedScrollHandler, useReducedMotion, useSharedValue } from 'react-native-reanimated';

import { CollapsibleHeaderScrollContext } from '../../context/collapsible-header-scroll.context';
import { createCollapsibleHeaderScrollWorklets } from '../../util/create-collapsible-header-scroll-worklets/create-collapsible-header-scroll-worklets';

import type { CollapsibleHeaderSnapConfig } from '../../interface/collapsible-header-snap-config.interface';
import type { CollapsibleHeaderScrollRef } from '../../type/collapsible-header-scroll-ref.type';
import type { Maybe } from '@rnw-community/shared';
import type { Component, PropsWithChildren, ReactElement } from 'react';

/**
 * Owns the scroll wiring so descendant headers and scrollables connect without manual plumbing.
 * @see https://github.com/rnw-community/rnw-community/tree/master/packages/react-native-collapsible-header#collapsibleheaderprovider
 */
export const CollapsibleHeaderProvider = ({ children }: PropsWithChildren): ReactElement => {
    const scrollY = useSharedValue(0);
    const scrollRef: CollapsibleHeaderScrollRef = useAnimatedRef<Component>();
    const snapConfig = useSharedValue<Maybe<CollapsibleHeaderSnapConfig>>(null);
    const snapSettleGeneration = useSharedValue(0);
    const snapAnimated = !useReducedMotion();
    const onScroll = useAnimatedScrollHandler(
        createCollapsibleHeaderScrollWorklets({ scrollY, scrollRef, snapConfig, snapSettleGeneration, snapAnimated })
    );

    return (
        <CollapsibleHeaderScrollContext.Provider value={{ onScroll, scrollRef, scrollY, snapConfig }}>
            {children}
        </CollapsibleHeaderScrollContext.Provider>
    );
};
