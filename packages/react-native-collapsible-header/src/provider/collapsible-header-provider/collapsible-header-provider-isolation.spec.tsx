import { describe, expect, it } from '@jest/globals';
import { fireEvent, render, screen } from '@testing-library/react-native';
import React, { useEffect } from 'react';
import { Text } from 'react-native';
import Animated from 'react-native-reanimated';

import { getDefined } from '@rnw-community/shared';

import { CollapsibleHeader } from '../../collapsible-header/collapsible-header';
import { useCollapsibleHeaderScroll } from '../../hooks/use-collapsible-header-scroll/use-collapsible-header-scroll.hook';

import { CollapsibleHeaderProvider } from './collapsible-header-provider';

import type { CollapsibleHeaderScroll } from '../../interface/collapsible-header-scroll.interface';
import type { Maybe, OnEventFn } from '@rnw-community/shared';

const EXPANDED_HEIGHT = 156;
const COLLAPSED_HEIGHT = 40;
const COLLAPSE_DISTANCE = 100;
const SCROLLED_OFFSET = 100;

const Screen = ({ name, onCapture }: { readonly name: string; readonly onCapture: OnEventFn<CollapsibleHeaderScroll> }) => {
    const scroll = useCollapsibleHeaderScroll();

    useEffect(() => void onCapture(scroll), [onCapture, scroll]);

    return (
        <>
            <CollapsibleHeader
                snap
                expandedHeight={EXPANDED_HEIGHT}
                collapsedHeight={COLLAPSED_HEIGHT}
                collapseDistance={COLLAPSE_DISTANCE}
                expandedContent={<Text>Expanded</Text>}
                collapsedContent={<Text>Collapsed</Text>}
            />
            <Animated.ScrollView onScroll={scroll.onScroll} scrollEventThrottle={16} testID={`${name}-scrollable`} />
        </>
    );
};

const captureScroll =
    (captured: { value: Maybe<CollapsibleHeaderScroll> }) =>
    (scroll: CollapsibleHeaderScroll): void => {
        captured.value = scroll;
    };
const getCapturedScroll = (captured: { readonly value: Maybe<CollapsibleHeaderScroll> }) =>
    getDefined(captured.value, () => {
        throw new Error('Scroll wiring was not provided');
    });

describe('CollapsibleHeaderProvider isolation', () => {
    it('keeps scroll offsets independent for sibling providers', () => {
        expect.hasAssertions();
        const first: { value: Maybe<CollapsibleHeaderScroll> } = { value: null };
        const second: { value: Maybe<CollapsibleHeaderScroll> } = { value: null };
        render(
            <>
                <CollapsibleHeaderProvider>
                    <Screen name="first" onCapture={captureScroll(first)} />
                </CollapsibleHeaderProvider>
                <CollapsibleHeaderProvider>
                    <Screen name="second" onCapture={captureScroll(second)} />
                </CollapsibleHeaderProvider>
            </>
        );

        expect(getCapturedScroll(first).scrollY).not.toBe(getCapturedScroll(second).scrollY);

        fireEvent.scroll(screen.getByTestId('first-scrollable'), {
            nativeEvent: { contentOffset: { y: SCROLLED_OFFSET } },
        });

        expect(getCapturedScroll(first).scrollY.get()).toBe(SCROLLED_OFFSET);
        expect(getCapturedScroll(second).scrollY.get()).toBe(0);
    });

    it('lets a snapping header in each sibling provider claim its own scrollable', () => {
        expect.hasAssertions();
        const first: { value: Maybe<CollapsibleHeaderScroll> } = { value: null };
        const second: { value: Maybe<CollapsibleHeaderScroll> } = { value: null };
        render(
            <>
                <CollapsibleHeaderProvider>
                    <Screen name="first" onCapture={captureScroll(first)} />
                </CollapsibleHeaderProvider>
                <CollapsibleHeaderProvider>
                    <Screen name="second" onCapture={captureScroll(second)} />
                </CollapsibleHeaderProvider>
            </>
        );

        expect(getCapturedScroll(first).scrollRef).not.toBe(getCapturedScroll(second).scrollRef);
        expect(getCapturedScroll(first).onScroll).not.toBe(getCapturedScroll(second).onScroll);
    });
});
