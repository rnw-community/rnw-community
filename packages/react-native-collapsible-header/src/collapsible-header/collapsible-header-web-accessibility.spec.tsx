import { describe, expect, it, jest } from '@jest/globals';
import { render, screen } from '@testing-library/react-native';
import React from 'react';
import { Text } from 'react-native';
import { useSharedValue } from 'react-native-reanimated';

import { CollapsibleHeader } from './collapsible-header';

jest.mock('../util/get-collapsible-header-layer-accessibility-props/get-collapsible-header-layer-accessibility-props', () =>
    jest.requireActual(
        '../util/get-collapsible-header-layer-accessibility-props/get-collapsible-header-layer-accessibility-props.web'
    )
);

const EXPANDED_HEIGHT = 156;
const COLLAPSED_HEIGHT = 40;
const COLLAPSE_DISTANCE = 100;

interface SubjectProps {
    readonly scrollOffset: number;
}

const Subject = ({ scrollOffset }: SubjectProps) => {
    const scrollY = useSharedValue(scrollOffset);

    return (
        <CollapsibleHeader
            testID="header"
            scrollY={scrollY}
            expandedHeight={EXPANDED_HEIGHT}
            collapsedHeight={COLLAPSED_HEIGHT}
            collapseDistance={COLLAPSE_DISTANCE}
            expandedContent={<Text>Expanded</Text>}
            collapsedContent={<Text>Collapsed</Text>}
        />
    );
};

const getLayerAriaHidden = (layer: string): unknown =>
    screen.getByTestId(`header-${layer}`, { includeHiddenElements: true }).props['aria-hidden'];

describe('CollapsibleHeader web accessibility handoff', () => {
    it.each([
        { name: 'expanded endpoint', scrollOffset: 0, expandedHidden: false, collapsedHidden: true },
        { name: 'collapsed endpoint', scrollOffset: COLLAPSE_DISTANCE, expandedHidden: true, collapsedHidden: false },
    ])('hides only the inert layer with aria-hidden at the $name', ({ scrollOffset, expandedHidden, collapsedHidden }) => {
        expect.hasAssertions();
        render(<Subject scrollOffset={scrollOffset} />);

        expect(getLayerAriaHidden('expanded')).toBe(expandedHidden);
        expect(getLayerAriaHidden('collapsed')).toBe(collapsedHidden);
    });

    it('leaves the native-only accessibility props off web layers', () => {
        expect.hasAssertions();
        render(<Subject scrollOffset={0} />);
        const collapsedLayerProps = screen.getByTestId('header-collapsed', { includeHiddenElements: true }).props;

        expect(collapsedLayerProps).not.toHaveProperty('accessibilityElementsHidden');
        expect(collapsedLayerProps).not.toHaveProperty('importantForAccessibility');
    });
});
