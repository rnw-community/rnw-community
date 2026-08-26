import { describe, expect, it } from '@jest/globals';
import { render, screen } from '@testing-library/react-native';
import React, { useContext, useEffect } from 'react';
import { Freeze } from 'react-freeze';
import { Text } from 'react-native';
import { getAnimatedStyle, makeMutable } from 'react-native-reanimated';

import { getDefined } from '@rnw-community/shared';

import { CollapsibleHeaderScrollContext } from '../context/collapsible-header-scroll.context';
import { CollapsibleHeaderProvider } from '../provider/collapsible-header-provider/collapsible-header-provider';

import { CollapsibleHeader } from './collapsible-header';

import type { CollapsibleHeaderScrollContextValue } from '../interface/collapsible-header-scroll-context-value.interface';
import type { Maybe, OnEventFn } from '@rnw-community/shared';
import type { ViewProps } from 'react-native';
import type { SharedValue } from 'react-native-reanimated';

const EXPANDED_HEIGHT = 156;
const COLLAPSED_HEIGHT = 40;
const COLLAPSE_DISTANCE = 100;

const Subject = ({ frozen, scrollY }: { readonly frozen: boolean; readonly scrollY: SharedValue<number> }) => (
    <Freeze freeze={frozen}>
        <CollapsibleHeader
            testID="header"
            scrollY={scrollY}
            expandedHeight={EXPANDED_HEIGHT}
            collapsedHeight={COLLAPSED_HEIGHT}
            collapseDistance={COLLAPSE_DISTANCE}
            expandedContent={<Text testID="expanded-content">Expanded</Text>}
            collapsedContent={<Text testID="collapsed-content">Collapsed</Text>}
        />
    </Freeze>
);

const ContextProbe = ({ onCapture }: { readonly onCapture: OnEventFn<Maybe<CollapsibleHeaderScrollContextValue>> }) => {
    const scrollContext = useContext(CollapsibleHeaderScrollContext);

    useEffect(() => void onCapture(scrollContext), [onCapture, scrollContext]);

    return <Text>Probe</Text>;
};

const SnapSubject = ({ frozen }: { readonly frozen: boolean }) => (
    <Freeze freeze={frozen}>
        <CollapsibleHeader
            snap
            expandedHeight={EXPANDED_HEIGHT}
            collapsedHeight={COLLAPSED_HEIGHT}
            collapseDistance={COLLAPSE_DISTANCE}
            expandedContent={<Text>Expanded</Text>}
            collapsedContent={<Text>Collapsed</Text>}
        />
    </Freeze>
);

const getLayer = (layer: string) => screen.getByTestId(`header-${layer}`, { includeHiddenElements: true });
const getCapturedSnapConfig = (captured: { readonly value: Maybe<CollapsibleHeaderScrollContextValue> }) =>
    getDefined(captured.value, () => {
        throw new Error('Scroll context was not provided');
    }).snapConfig.get();

describe('CollapsibleHeader under react-freeze', () => {
    it('keeps the collapsed state derived from the scroll value across freeze and unfreeze', () => {
        expect.hasAssertions();
        const scrollY = makeMutable(COLLAPSE_DISTANCE);
        render(<Subject frozen={false} scrollY={scrollY} />);

        expect(getAnimatedStyle(getLayer('collapsed'))).toMatchObject({ opacity: 1, pointerEvents: 'box-none' });

        screen.rerender(<Subject frozen scrollY={scrollY} />);

        expect(screen.getByTestId('collapsed-content', { includeHiddenElements: true })).toBeOnTheScreen();

        screen.rerender(<Subject frozen={false} scrollY={scrollY} />);

        expect(getAnimatedStyle(getLayer('collapsed'))).toMatchObject({ opacity: 1, pointerEvents: 'box-none' });
        expect(getAnimatedStyle(getLayer('expanded'))).toMatchObject({ opacity: 0, pointerEvents: 'none' });
        expect((getLayer('expanded').props as ViewProps).accessibilityElementsHidden).toBe(true);
        expect((getLayer('collapsed').props as ViewProps).accessibilityElementsHidden).toBe(false);
    });

    it('keeps snap geometry registered after a freeze and unfreeze cycle', () => {
        expect.hasAssertions();
        const captured: { value: Maybe<CollapsibleHeaderScrollContextValue> } = { value: null };
        const onCapture = (value: Maybe<CollapsibleHeaderScrollContextValue>): void => {
            captured.value = value;
        };
        render(
            <CollapsibleHeaderProvider>
                <SnapSubject frozen={false} />
                <ContextProbe onCapture={onCapture} />
            </CollapsibleHeaderProvider>
        );
        const expectedSnapConfig = { snapStart: 0, snapEnd: COLLAPSE_DISTANCE };

        expect(getCapturedSnapConfig(captured)).toStrictEqual(expectedSnapConfig);

        screen.rerender(
            <CollapsibleHeaderProvider>
                <SnapSubject frozen />
                <ContextProbe onCapture={onCapture} />
            </CollapsibleHeaderProvider>
        );
        screen.rerender(
            <CollapsibleHeaderProvider>
                <SnapSubject frozen={false} />
                <ContextProbe onCapture={onCapture} />
            </CollapsibleHeaderProvider>
        );

        expect(getCapturedSnapConfig(captured)).toStrictEqual(expectedSnapConfig);
    });
});
