import { describe, expect, it } from '@jest/globals';
import { render } from '@testing-library/react-native';
import React from 'react';
import { Text, View } from 'react-native';
import { useSharedValue } from 'react-native-reanimated';

import { CollapsibleHeader } from '../../collapsible-header/collapsible-header';

import { useCollapsibleHeaderProgress } from './use-collapsible-header-progress.hook';

const EXPANDED_HEIGHT = 156;
const COLLAPSED_HEIGHT = 40;
const COLLAPSE_DISTANCE = 100;
const INTERMEDIATE_SCROLL_OFFSET = 58;
const INTERMEDIATE_PROGRESS = 0.58;

const ProgressProbe = () => {
    const progress = useCollapsibleHeaderProgress();

    return <View style={{ opacity: progress.get() }} testID="progress-probe" />;
};

const Subject = ({ scrollOffset }: { readonly scrollOffset: number }) => {
    const scrollY = useSharedValue(scrollOffset);

    return (
        <CollapsibleHeader
            scrollY={scrollY}
            expandedHeight={EXPANDED_HEIGHT}
            collapsedHeight={COLLAPSED_HEIGHT}
            collapseDistance={COLLAPSE_DISTANCE}
            expandedContent={<ProgressProbe />}
            collapsedContent={<Text>Collapsed</Text>}
        />
    );
};

describe('useCollapsibleHeaderProgress', () => {
    it.each([
        { name: 'expanded endpoint', scrollOffset: 0, progress: 0 },
        { name: 'intermediate offset', scrollOffset: INTERMEDIATE_SCROLL_OFFSET, progress: INTERMEDIATE_PROGRESS },
        { name: 'collapsed endpoint', scrollOffset: COLLAPSE_DISTANCE, progress: 1 },
    ])('exposes collapse progress to slot content at the $name', ({ scrollOffset, progress }) => {
        expect.hasAssertions();
        const screen = render(<Subject scrollOffset={scrollOffset} />);
        const probe = screen.getByTestId('progress-probe', { includeHiddenElements: true });
        const probeStyle = (probe.props as { style: { opacity: number } }).style;

        expect(probeStyle.opacity).toBeCloseTo(progress);
    });

    it('requires a header ancestor', () => {
        expect.hasAssertions();

        expect(() => render(<ProgressProbe />)).toThrow(
            'useCollapsibleHeaderProgress requires a CollapsibleHeader ancestor'
        );
    });
});
