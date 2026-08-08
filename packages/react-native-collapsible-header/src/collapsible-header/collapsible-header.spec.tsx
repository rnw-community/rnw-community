import { describe, expect, it } from '@jest/globals';
import { render } from '@testing-library/react-native';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSharedValue } from 'react-native-reanimated';

import { getDefined } from '@rnw-community/shared';

import { CollapsibleHeader } from './collapsible-header.js';

import type { CollapsibleHeaderMotionConfig } from '../interface/collapsible-header-motion-config.interface.js';
import type { CollapsibleHeaderProps } from '../interface/collapsible-header-props.interface.js';
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
    Pick<CollapsibleHeaderProps, 'expandedHeight' | 'collapsedHeight' | 'collapseDistance' | 'collapseStart' | 'motion'>
> & {
    readonly withPersistentContent?: boolean;
};

type LayerProps = Pick<ViewProps, 'pointerEvents'> & { readonly style: StyleProp<ViewStyle> };

const Subject = ({
    expandedHeight = EXPANDED_HEIGHT,
    collapsedHeight = COLLAPSED_HEIGHT,
    collapseDistance = COLLAPSE_DISTANCE,
    collapseStart,
    motion,
    withPersistentContent = false,
}: SubjectProps) => {
    const scrollY = useSharedValue(0);
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
            motion={motion}
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
        expect(screen.getByTestId('collapsed-content')).toBeOnTheScreen();
        expect(screen.getAllByTestId('persistent-content')).toHaveLength(1);
        expect(persistentStyle).toMatchObject({ zIndex: PERSISTENT_LAYER });
        expect(persistentStyle.zIndex).toBeGreaterThan(EXPANDED_LAYER);
        expect(persistentStyle.zIndex).toBeGreaterThan(COLLAPSED_LAYER);
        expect(screen.getByTestId('collapsible-header')).toHaveProp('accessibilityLabel', 'Account summary');
        expect(screen.getByTestId('collapsible-header')).toHaveStyle({ paddingTop: OUTER_PADDING });
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
