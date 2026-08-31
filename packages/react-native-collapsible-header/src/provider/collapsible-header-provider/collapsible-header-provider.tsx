import React from 'react';
import {
    useAnimatedRef,
    useAnimatedScrollHandler,
    useReducedMotion,
    useScrollOffset,
    useSharedValue,
} from 'react-native-reanimated';

import { CollapsibleHeaderScrollContext } from '../../context/collapsible-header-scroll.context';
import { createCollapsibleHeaderScrollWorklets } from '../../util/create-collapsible-header-scroll-worklets/create-collapsible-header-scroll-worklets';

import type { CollapsibleHeaderSnapConfig } from '../../interface/collapsible-header-snap-config.interface';
import type { CollapsibleHeaderScrollRef } from '../../type/collapsible-header-scroll-ref.type';
import type { Maybe } from '@rnw-community/shared';
import type { Component, PropsWithChildren, ReactElement } from 'react';

interface Props extends PropsWithChildren {
    readonly syncNativeScrollOffset?: boolean;
}

/**
 * Owns the scroll wiring so descendant headers and scrollables connect without manual plumbing.
 * @see https://github.com/rnw-community/rnw-community/tree/master/packages/react-native-collapsible-header#collapsibleheaderprovider
 */
export const CollapsibleHeaderProvider = ({ children, syncNativeScrollOffset = false }: Props): ReactElement => {
    const scrollY = useSharedValue(0);
    const scrollRef: CollapsibleHeaderScrollRef = useAnimatedRef<Component>();
    const snapConfig = useSharedValue<Maybe<CollapsibleHeaderSnapConfig>>(null);
    const snapSettleGeneration = useSharedValue(0);
    const snapAnimated = !useReducedMotion();
    const onScroll = useAnimatedScrollHandler(
        createCollapsibleHeaderScrollWorklets({ scrollY, scrollRef, snapConfig, snapSettleGeneration, snapAnimated })
    );

    // Opt-in because resolving the ref to a host instance is what mirrors the native offset: refs that expose
    // only an imperative handle (a supported attachment) never resolve to one and would throw in observe().
    // With it off, a navigator restoring a scrolled screen without an accompanying scroll event leaves scrollY
    // at its stale value until the next scroll; consumers whose ref always lands on a real scrollable enable it.
    useScrollOffset(syncNativeScrollOffset ? scrollRef : null, scrollY);

    return (
        <CollapsibleHeaderScrollContext.Provider value={{ onScroll, scrollRef, scrollY, snapConfig }}>
            {children}
        </CollapsibleHeaderScrollContext.Provider>
    );
};
