import { render } from '@testing-library/react-native';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSharedValue } from 'react-native-reanimated';

import { getDefined } from '@rnw-community/shared';

import { CollapsibleHeader } from './collapsible-header.js';

import type { CollapsibleHeaderProps } from '../interface/collapsible-header-props.interface.js';
import type { StyleProp, ViewProps, ViewStyle } from 'react-native';
import type { ReactTestInstance } from 'react-test-renderer';

export const BACKGROUND_LAYER = 1;
export const HEADER_LAYER = 2;
export const EXPANDED_LAYER = 3;
export const COLLAPSED_LAYER = 4;
export const PERSISTENT_LAYER = 5;
export const EXPANDED_HEIGHT = 156;
export const COLLAPSED_HEIGHT = 40;
export const COLLAPSE_DISTANCE = 100;
export const CUSTOM_COLLAPSE_START = 20;
export const CUSTOM_COLLAPSE_DISTANCE = 80;
export const OUTER_PADDING = 24;
export const INVALID_EXPANDED_HEIGHT = 39;
export const NEGATIVE_SCROLL_OFFSET = -20;
export const BEYOND_COLLAPSE_SCROLL_OFFSET = 140;
export const INTERMEDIATE_SCROLL_OFFSET = 75;
export const INTERMEDIATE_HEIGHT = 69;
export const INTERMEDIATE_TRANSLATE_Y = -15;
export const CUSTOM_INTERMEDIATE_HEIGHT = 98;
export const BEFORE_COLLAPSED_ENDPOINT_SCROLL_OFFSET = 50;
export const COLLAPSED_SCALE = 0.9;
export const INTERMEDIATE_SCALE = 0.925;

type SubjectProps = Partial<
    Pick<CollapsibleHeaderProps, 'expandedHeight' | 'collapsedHeight' | 'collapseDistance' | 'collapseStart' | 'motion'>
> & {
    readonly scrollOffset?: number;
    readonly withPersistentContent?: boolean;
};

type LayerProps = Pick<ViewProps, 'pointerEvents'> & { readonly style: StyleProp<ViewStyle> };

export const Subject = ({
    scrollOffset = 0,
    expandedHeight = EXPANDED_HEIGHT,
    collapsedHeight = COLLAPSED_HEIGHT,
    collapseDistance = COLLAPSE_DISTANCE,
    collapseStart,
    motion,
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

export const getLayerProps = (layer: ReactTestInstance): LayerProps => layer.props as LayerProps;

export const getLayer = (screen: ReturnType<typeof render>, marker: number): ReactTestInstance =>
    getDefined(
        screen.UNSAFE_getAllByType(View).find(layer => StyleSheet.flatten(getLayerProps(layer).style).zIndex === marker),
        () => {
            throw new Error(`Layer ${marker} was not rendered`);
        }
    );
