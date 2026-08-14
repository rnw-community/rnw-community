import { describe, expect, it } from '@jest/globals';
import { render, screen } from '@testing-library/react-native';
import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { getAnimatedStyle, makeMutable, useSharedValue } from 'react-native-reanimated';

import { CollapsibleHeader } from './collapsible-header';

import type { CollapsibleHeaderMotionConfig } from '../interface/collapsible-header-motion-config.interface';
import type { CollapsibleHeaderProps } from '../interface/collapsible-header-props.interface';
import type { StyleProp, ViewProps, ViewStyle } from 'react-native';

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
            testID="header"
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

const getLayer = (layer: string) => screen.getByTestId(`header-${layer}`, { includeHiddenElements: true });
const getLayerA11y = (layer: string): Pick<ViewProps, 'accessibilityElementsHidden' | 'importantForAccessibility'> =>
    getLayer(layer).props;

describe('CollapsibleHeader rendering', () => {
    it('renders caller-owned persistent content once above transition layers', () => {
        expect.hasAssertions();
        render(<Subject withPersistentContent />);

        expect(screen.getByTestId('expanded-content')).toBeOnTheScreen();
        expect(screen.getByTestId('collapsed-content', { includeHiddenElements: true })).toBeOnTheScreen();
        expect(screen.getAllByTestId('persistent-content')).toHaveLength(1);
        expect(getLayer('persistent')).toHaveProp('pointerEvents', 'box-none');
        expect(screen.getByTestId('header')).toHaveProp('accessibilityLabel', 'Account summary');
        expect(screen.getByTestId('header')).toHaveStyle({ paddingTop: OUTER_PADDING });
    });

    it('skips the persistent layer and layer test identifiers when not configured', () => {
        expect.hasAssertions();
        render(
            <CollapsibleHeader
                scrollY={makeMutable(0)}
                expandedHeight={EXPANDED_HEIGHT}
                collapsedHeight={COLLAPSED_HEIGHT}
                expandedContent={<Text>Expanded</Text>}
                collapsedContent={<Text testID="collapsed-content">Collapsed</Text>}
            />
        );

        expect(screen.queryByTestId('header-persistent', { includeHiddenElements: true })).toBeNull();
        expect(screen.queryByTestId('header-expanded', { includeHiddenElements: true })).toBeNull();
        expect(screen.getByTestId('collapsed-content', { includeHiddenElements: true })).toBeOnTheScreen();
    });

    it('hides the invisible layer from the accessibility tree at each endpoint', () => {
        expect.hasAssertions();
        render(<Subject />);

        expect(getLayerA11y('expanded').accessibilityElementsHidden).toBe(false);
        expect(getLayerA11y('expanded').importantForAccessibility).toBe('auto');
        expect(getLayerA11y('collapsed').accessibilityElementsHidden).toBe(true);
        expect(getLayerA11y('collapsed').importantForAccessibility).toBe('no-hide-descendants');

        render(<Subject scrollOffset={COLLAPSE_DISTANCE} />);

        expect(getLayerA11y('expanded').accessibilityElementsHidden).toBe(true);
        expect(getLayerA11y('collapsed').accessibilityElementsHidden).toBe(false);
    });

    it('keeps the header in layout flow by default and pins it in overlay mode', () => {
        expect.hasAssertions();
        render(<Subject />);
        const getContainerStyle = (): ViewStyle =>
            StyleSheet.flatten((screen.getByTestId('header').props as { style: StyleProp<ViewStyle> }).style);

        expect(getContainerStyle().position).toBeUndefined();

        render(<Subject mode="overlay" />);

        expect(getContainerStyle()).toMatchObject({
            position: 'absolute',
            top: 0,
            right: 0,
            left: 0,
            paddingTop: OUTER_PADDING,
        });
    });

    it('defaults the collapse distance to the height delta', () => {
        expect.hasAssertions();
        render(<Subject collapseDistance={DEFAULT_COLLAPSE_DISTANCE} scrollOffset={DEFAULT_COLLAPSE_DISTANCE} />);

        expect(getAnimatedStyle(getLayer('header'))).toMatchObject({ height: COLLAPSED_HEIGHT });
    });

    it.each([
        { name: 'stretches the header on overscroll when enabled', stretchOnOverscroll: true, height: STRETCHED_HEIGHT },
        { name: 'clamps the header on overscroll by default', stretchOnOverscroll: false, height: EXPANDED_HEIGHT },
    ])('$name', ({ stretchOnOverscroll, height }) => {
        expect.hasAssertions();
        render(<Subject scrollOffset={NEGATIVE_SCROLL_OFFSET} stretchOnOverscroll={stretchOnOverscroll} />);

        expect(getAnimatedStyle(getLayer('header'))).toMatchObject({ height });
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
