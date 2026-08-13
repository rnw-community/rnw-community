import { describe, expect, it } from '@jest/globals';
import { render } from '@testing-library/react-native';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSharedValue } from 'react-native-reanimated';

import { getDefined } from '@rnw-community/shared';

import { CollapsibleHeader } from './collapsible-header';

import type { CollapsibleHeaderMotionConfig } from '../interface/collapsible-header-motion-config.interface';
import type { CollapsibleHeaderProps } from '../interface/collapsible-header-props.interface';
import type { StyleProp, ViewProps, ViewStyle } from 'react-native';
import type { ReactTestInstance } from 'react-test-renderer';

const BACKGROUND_LAYER = 1;
const HEADER_LAYER = 2;
const EXPANDED_LAYER = 3;
const COLLAPSED_LAYER = 4;
const PERSISTENT_LAYER = 5;
const EXPANDED_HEIGHT = 156;
const COLLAPSED_HEIGHT = 40;
const COLLAPSE_DISTANCE = 100;
const DEFAULT_COLLAPSE_DISTANCE = EXPANDED_HEIGHT - COLLAPSED_HEIGHT;
const NEGATIVE_SCROLL_OFFSET = -20;
const STRETCHED_HEIGHT = EXPANDED_HEIGHT - NEGATIVE_SCROLL_OFFSET;
const OUTER_PADDING = 24;
const INVALID_EXPANDED_HEIGHT = 39;
const INVALID_LOW_PROGRESS = -0.1;
const INVALID_HIGH_PROGRESS = 1.1;

const progressFields = [
    'expandedOpacityEndProgress',
    'collapsedOpacityStartProgress',
    'backgroundOpacityStartProgress',
    'pointerEventsSwitchProgress',
] as const satisfies readonly (keyof CollapsibleHeaderMotionConfig)[];

type SubjectProps = Partial<
    Pick<
        CollapsibleHeaderProps,
        | 'collapseDistance'
        | 'collapseStart'
        | 'collapsedHeight'
        | 'expandedHeight'
        | 'mode'
        | 'motion'
        | 'snap'
        | 'stretchOnOverscroll'
    >
> & {
    readonly scrollOffset?: number;
    readonly withPersistentContent?: boolean;
};

type LayerProps = Pick<ViewProps, 'accessibilityElementsHidden' | 'importantForAccessibility'> & {
    readonly style: StyleProp<ViewStyle>;
};

const Subject = ({
    scrollOffset = 0,
    expandedHeight = EXPANDED_HEIGHT,
    collapsedHeight = COLLAPSED_HEIGHT,
    collapseDistance = COLLAPSE_DISTANCE,
    collapseStart,
    mode,
    motion,
    snap,
    stretchOnOverscroll,
    withPersistentContent = false,
}: SubjectProps) => {
    const scrollY = useSharedValue(scrollOffset);
    const persistentContent = withPersistentContent ? <Text testID="persistent-content">Persistent</Text> : null;

    return (
        <CollapsibleHeader
            accessibilityLabel="Account summary"
            testID="collapsible-header"
            style={{ paddingTop: OUTER_PADDING }}
            scrollY={scrollY}
            expandedHeight={expandedHeight}
            collapsedHeight={collapsedHeight}
            collapseDistance={collapseDistance}
            collapseStart={collapseStart}
            mode={mode}
            motion={motion}
            snap={snap}
            stretchOnOverscroll={stretchOnOverscroll}
            expandedContent={<Text testID="expanded-content">Expanded</Text>}
            collapsedContent={<Text testID="collapsed-content">Collapsed</Text>}
            persistentContent={persistentContent}
            backgroundStyle={{ zIndex: BACKGROUND_LAYER }}
            headerStyle={{ zIndex: HEADER_LAYER }}
            expandedContentContainerStyle={{ zIndex: EXPANDED_LAYER }}
            collapsedContentContainerStyle={{ zIndex: COLLAPSED_LAYER }}
            persistentContentContainerStyle={{ zIndex: PERSISTENT_LAYER }}
        />
    );
};

const DefaultDistanceSubject = ({ scrollOffset }: { readonly scrollOffset: number }) => {
    const scrollY = useSharedValue(scrollOffset);

    return (
        <CollapsibleHeader
            scrollY={scrollY}
            expandedHeight={EXPANDED_HEIGHT}
            collapsedHeight={COLLAPSED_HEIGHT}
            headerStyle={{ zIndex: HEADER_LAYER }}
            expandedContent={<Text>Expanded</Text>}
            collapsedContent={<Text>Collapsed</Text>}
        />
    );
};

const ProviderlessSubject = ({ snap = false }: { readonly snap?: boolean }) => {
    const scrollY = useSharedValue(0);
    const scrollYProps = snap ? { scrollY } : {};

    return (
        <CollapsibleHeader
            {...scrollYProps}
            expandedHeight={EXPANDED_HEIGHT}
            collapsedHeight={COLLAPSED_HEIGHT}
            snap={snap}
            expandedContent={<Text>Expanded</Text>}
            collapsedContent={<Text>Collapsed</Text>}
        />
    );
};

const getLayerProps = (layer: ReactTestInstance): LayerProps => layer.props as LayerProps;
const getLayer = (screen: ReturnType<typeof render>, marker: number): ReactTestInstance =>
    getDefined(
        screen.UNSAFE_getAllByType(View).find(layer => StyleSheet.flatten(getLayerProps(layer).style).zIndex === marker),
        () => {
            throw new Error(`Layer ${marker} was not rendered`);
        }
    );

describe('CollapsibleHeader rendering', () => {
    it('renders caller-owned persistent content once above transition layers', () => {
        expect.hasAssertions();
        const screen = render(<Subject withPersistentContent />);
        const persistentStyle = StyleSheet.flatten(getLayerProps(getLayer(screen, PERSISTENT_LAYER)).style);

        expect(screen.getByTestId('expanded-content')).toBeOnTheScreen();
        expect(screen.getByTestId('collapsed-content', { includeHiddenElements: true })).toBeOnTheScreen();
        expect(screen.getAllByTestId('persistent-content')).toHaveLength(1);
        expect(persistentStyle).toMatchObject({ zIndex: PERSISTENT_LAYER });
        expect(persistentStyle.zIndex).toBeGreaterThan(EXPANDED_LAYER);
        expect(persistentStyle.zIndex).toBeGreaterThan(COLLAPSED_LAYER);
        expect(screen.getByTestId('collapsible-header')).toHaveProp('accessibilityLabel', 'Account summary');
        expect(screen.getByTestId('collapsible-header')).toHaveStyle({ paddingTop: OUTER_PADDING });
    });

    it('hides the invisible layer from the accessibility tree at each endpoint', () => {
        expect.hasAssertions();
        const expandedScreen = render(<Subject />);
        const expandedProps = getLayerProps(getLayer(expandedScreen, EXPANDED_LAYER));
        const collapsedProps = getLayerProps(getLayer(expandedScreen, COLLAPSED_LAYER));

        expect(expandedProps.accessibilityElementsHidden).toBe(false);
        expect(expandedProps.importantForAccessibility).toBe('auto');
        expect(collapsedProps.accessibilityElementsHidden).toBe(true);
        expect(collapsedProps.importantForAccessibility).toBe('no-hide-descendants');

        const collapsedScreen = render(<Subject scrollOffset={COLLAPSE_DISTANCE} />);

        expect(getLayerProps(getLayer(collapsedScreen, EXPANDED_LAYER)).accessibilityElementsHidden).toBe(true);
        expect(getLayerProps(getLayer(collapsedScreen, COLLAPSED_LAYER)).accessibilityElementsHidden).toBe(false);
    });

    it('keeps the header in layout flow by default and pins it in overlay mode', () => {
        expect.hasAssertions();
        const flowScreen = render(<Subject />);
        const flowStyle = StyleSheet.flatten(getLayerProps(flowScreen.getByTestId('collapsible-header')).style);

        expect(flowStyle.position).toBeUndefined();

        const overlayScreen = render(<Subject mode="overlay" />);
        const overlayStyle = StyleSheet.flatten(getLayerProps(overlayScreen.getByTestId('collapsible-header')).style);

        expect(overlayStyle).toMatchObject({ position: 'absolute', top: 0, right: 0, left: 0, paddingTop: OUTER_PADDING });
    });

    it.each([
        { name: 'stretches the header on overscroll when enabled', stretchOnOverscroll: true, height: STRETCHED_HEIGHT },
        { name: 'clamps the header on overscroll by default', stretchOnOverscroll: false, height: EXPANDED_HEIGHT },
    ])('$name', ({ stretchOnOverscroll, height }) => {
        expect.hasAssertions();
        const screen = render(<Subject scrollOffset={NEGATIVE_SCROLL_OFFSET} stretchOnOverscroll={stretchOnOverscroll} />);

        expect(StyleSheet.flatten(getLayerProps(getLayer(screen, HEADER_LAYER)).style)).toMatchObject({ height });
    });

    it('defaults the collapse distance to the height delta', () => {
        expect.hasAssertions();
        const screen = render(<DefaultDistanceSubject scrollOffset={DEFAULT_COLLAPSE_DISTANCE} />);

        expect(StyleSheet.flatten(getLayerProps(getLayer(screen, HEADER_LAYER)).style)).toMatchObject({
            height: COLLAPSED_HEIGHT,
        });
    });
});

describe('CollapsibleHeader scroll wiring', () => {
    it('requires a scrollY prop or provider ancestor', () => {
        expect.hasAssertions();

        expect(() => render(<ProviderlessSubject />)).toThrow(
            'CollapsibleHeader requires a scrollY prop or a CollapsibleHeaderProvider ancestor'
        );
    });

    it('requires a provider ancestor for snapping', () => {
        expect.hasAssertions();

        expect(() => render(<ProviderlessSubject snap />)).toThrow(
            'CollapsibleHeader snap requires a CollapsibleHeaderProvider ancestor'
        );
    });
});

describe('CollapsibleHeader geometry', () => {
    it.each([
        ['expandedHeight', { expandedHeight: 0 }, 'expandedHeight must be a finite number greater than zero'],
        ['expandedHeight', { expandedHeight: Infinity }, 'expandedHeight must be a finite number greater than zero'],
        ['collapsedHeight', { collapsedHeight: 0 }, 'collapsedHeight must be a finite number greater than zero'],
        ['collapsedHeight', { collapsedHeight: Infinity }, 'collapsedHeight must be a finite number greater than zero'],
        ['collapseDistance', { collapseDistance: 0 }, 'collapseDistance must be a finite number greater than zero'],
        ['collapseDistance', { collapseDistance: Infinity }, 'collapseDistance must be a finite number greater than zero'],
        ['collapseStart', { collapseStart: -1 }, 'collapseStart must be a finite number greater than or equal to zero'],
        [
            'height order',
            { expandedHeight: INVALID_EXPANDED_HEIGHT, collapsedHeight: COLLAPSED_HEIGHT },
            'expandedHeight must be greater than or equal to collapsedHeight',
        ],
    ])('rejects invalid %s geometry', (_name, overrides, message) => {
        expect.hasAssertions();

        expect(() => render(<Subject {...overrides} />)).toThrow(message);
    });
});

describe('CollapsibleHeader motion config', () => {
    it.each(
        progressFields.flatMap(field => [
            { field, value: INVALID_LOW_PROGRESS },
            { field, value: INVALID_HIGH_PROGRESS },
        ])
    )('rejects invalid $field progress $value', ({ field, value }) => {
        expect.hasAssertions();

        expect(() => render(<Subject motion={{ [field]: value }} />)).toThrow(`${field} must be between zero and one`);
    });

    it.each(['expandedTranslateY', 'collapsedTranslateY'] as const)('rejects non-finite %s motion', field => {
        expect.hasAssertions();

        expect(() => render(<Subject motion={{ [field]: Infinity }} />)).toThrow(`${field} must be a finite number`);
    });

    it.each([0, Infinity])('rejects invalid expandedScale motion %s', expandedScale => {
        expect.hasAssertions();

        expect(() => render(<Subject motion={{ expandedScale }} />)).toThrow(
            'expandedScale must be a finite number greater than zero'
        );
    });

    it('rejects collapsed opacity starting after expanded opacity ends', () => {
        expect.hasAssertions();

        expect(() =>
            render(<Subject motion={{ collapsedOpacityStartProgress: 0.7, expandedOpacityEndProgress: 0.6 }} />)
        ).toThrow('collapsedOpacityStartProgress must be less than or equal to expandedOpacityEndProgress');
    });
});
