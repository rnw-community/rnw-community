import { describe, expect, it, jest } from '@jest/globals';
import { render } from '@testing-library/react-native';
import React, { forwardRef, useImperativeHandle } from 'react';
import Animated from 'react-native-reanimated';

import { emptyFn } from '@rnw-community/shared';

import { useCollapsibleHeaderScroll } from '../../hooks/use-collapsible-header-scroll/use-collapsible-header-scroll.hook';

import { CollapsibleHeaderProvider } from './collapsible-header-provider';

import type { ScrollHandlerProcessed } from 'react-native-reanimated';

interface ScrollableListHandle {
    readonly getScrollableNode: () => null;
    readonly scrollToOffset: (offset: number) => void;
}

const HandleList = forwardRef<ScrollableListHandle, { readonly onScroll: ScrollHandlerProcessed }>(({ onScroll }, ref) => {
    useImperativeHandle(ref, () => ({ getScrollableNode: () => null, scrollToOffset: emptyFn }));

    return <Animated.ScrollView testID="scrollable" onScroll={onScroll} scrollEventThrottle={16} />;
});
HandleList.displayName = 'HandleList';

const HostScrollableProbe = () => {
    const { onScroll, scrollRef } = useCollapsibleHeaderScroll();

    return <Animated.ScrollView testID="scrollable" ref={scrollRef} onScroll={onScroll} scrollEventThrottle={16} />;
};

const HandleListProbe = () => {
    const { onScroll, scrollRef } = useCollapsibleHeaderScroll();

    return <HandleList ref={scrollRef} onScroll={onScroll} />;
};

describe('CollapsibleHeaderProvider native offset sync', () => {
    it('mirrors the native offset over a host scrollable when enabled', () => {
        expect.hasAssertions();

        const screen = render(
            <CollapsibleHeaderProvider syncNativeScrollOffset>
                <HostScrollableProbe />
            </CollapsibleHeaderProvider>
        );

        expect(screen.getByTestId('scrollable')).toBeTruthy();
    });

    it('keeps imperative-handle scrollables working when the sync is left off', () => {
        expect.hasAssertions();

        const screen = render(
            <CollapsibleHeaderProvider>
                <HandleListProbe />
            </CollapsibleHeaderProvider>
        );

        expect(screen.getByTestId('scrollable')).toBeTruthy();
    });

    it('documents why the sync is opt-in: an imperative-handle ref cannot resolve to a host instance', () => {
        expect.hasAssertions();

        const spy = jest.spyOn(console, 'error').mockImplementation(emptyFn);

        expect(() =>
            render(
                <CollapsibleHeaderProvider syncNativeScrollOffset>
                    <HandleListProbe />
                </CollapsibleHeaderProvider>
            )
        ).toThrow();

        spy.mockRestore();
    });
});
