import { describe, expect, it } from '@jest/globals';
import { fireEvent, render } from '@testing-library/react-native';
import React, { useContext, useEffect } from 'react';
import { Text } from 'react-native';
import Animated from 'react-native-reanimated';

import { getDefined } from '@rnw-community/shared';

import { CollapsibleHeader } from '../../collapsible-header/collapsible-header';
import { CollapsibleHeaderScrollContext } from '../../context/collapsible-header-scroll.context';

import { CollapsibleHeaderProvider } from './collapsible-header-provider';

import type { CollapsibleHeaderScrollContextValue } from '../../interface/collapsible-header-scroll-context-value.interface';
import type { Maybe, OnEventFn } from '@rnw-community/shared';

const EXPANDED_HEIGHT = 156;
const COLLAPSED_HEIGHT = 40;
const COLLAPSE_START = 20;
const COLLAPSE_DISTANCE = 80;
const SCROLLED_OFFSET = 64;

const ContextProbe = ({ onCapture }: { readonly onCapture: OnEventFn<Maybe<CollapsibleHeaderScrollContextValue>> }) => {
    const scrollContext = useContext(CollapsibleHeaderScrollContext);

    useEffect(() => void onCapture(scrollContext), [onCapture, scrollContext]);

    return <Text>Probe</Text>;
};

const ScrollableProbe = () => {
    const scrollContext = useContext(CollapsibleHeaderScrollContext);

    return (
        <Animated.ScrollView
            testID="scrollable"
            scrollEventThrottle={16}
            onScroll={
                getDefined(scrollContext, () => {
                    throw new Error('Scroll context was not provided');
                }).onScroll
            }
        />
    );
};

const Header = ({ snap = false }: { readonly snap?: boolean }) => (
    <CollapsibleHeader
        snap={snap}
        expandedHeight={EXPANDED_HEIGHT}
        collapsedHeight={COLLAPSED_HEIGHT}
        collapseStart={COLLAPSE_START}
        collapseDistance={COLLAPSE_DISTANCE}
        expandedContent={<Text>Expanded</Text>}
        collapsedContent={<Text>Collapsed</Text>}
    />
);

describe('CollapsibleHeaderProvider', () => {
    it('provides scroll wiring updated by attached scrollables', () => {
        expect.hasAssertions();
        const captured: { value: Maybe<CollapsibleHeaderScrollContextValue> } = { value: null };
        const screen = render(
            <CollapsibleHeaderProvider>
                <Header />
                <ContextProbe
                    onCapture={value => {
                        captured.value = value;
                    }}
                />
                <ScrollableProbe />
            </CollapsibleHeaderProvider>
        );
        const scrollContext = getDefined(captured.value, () => {
            throw new Error('Scroll context was not provided');
        });

        expect(scrollContext.scrollY.get()).toBe(0);

        fireEvent.scroll(screen.getByTestId('scrollable'), { nativeEvent: { contentOffset: { y: SCROLLED_OFFSET } } });

        expect(scrollContext.scrollY.get()).toBe(SCROLLED_OFFSET);
    });

    it('registers snap geometry while a snapping header is mounted', () => {
        expect.hasAssertions();
        const captured: { value: Maybe<CollapsibleHeaderScrollContextValue> } = { value: null };
        const onCapture = (value: Maybe<CollapsibleHeaderScrollContextValue>): void => {
            captured.value = value;
        };
        const screen = render(
            <CollapsibleHeaderProvider>
                <Header snap />
                <ContextProbe onCapture={onCapture} />
            </CollapsibleHeaderProvider>
        );
        const scrollContext = getDefined(captured.value, () => {
            throw new Error('Scroll context was not provided');
        });

        expect(scrollContext.snapConfig.get()).toStrictEqual({
            snapStart: COLLAPSE_START,
            snapEnd: COLLAPSE_START + COLLAPSE_DISTANCE,
        });

        screen.rerender(
            <CollapsibleHeaderProvider>
                <ContextProbe onCapture={onCapture} />
            </CollapsibleHeaderProvider>
        );

        expect(scrollContext.snapConfig.get()).toBeNull();
    });

    it('keeps snap geometry unregistered for non-snapping headers', () => {
        expect.hasAssertions();
        const captured: { value: Maybe<CollapsibleHeaderScrollContextValue> } = { value: null };
        render(
            <CollapsibleHeaderProvider>
                <Header />
                <ContextProbe
                    onCapture={value => {
                        captured.value = value;
                    }}
                />
            </CollapsibleHeaderProvider>
        );

        expect(
            getDefined(captured.value, () => {
                throw new Error('Scroll context was not provided');
            }).snapConfig.get()
        ).toBeNull();
    });
});
