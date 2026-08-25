import { describe, expect, it } from '@jest/globals';
import { render } from '@testing-library/react-native';
import React from 'react';
import { Text } from 'react-native';

import { ScreenChromeFrame } from './screen-chrome-frame';

const CONSUMER_FLEX = 2;

describe('ScreenChromeFrame', () => {
    it('renders children in mount order so later layers paint above earlier ones', () => {
        expect.hasAssertions();

        const screen = render(
            <ScreenChromeFrame>
                <Text>Content</Text>
                <Text>Decoration</Text>
                <Text>Chrome</Text>
            </ScreenChromeFrame>
        );

        expect(screen.getAllByText(/^(Content|Decoration|Chrome)$/u)).toEqual([
            screen.getByText('Content'),
            screen.getByText('Decoration'),
            screen.getByText('Chrome'),
        ]);
    });

    it('forwards view props to the frame host', () => {
        expect.hasAssertions();

        const screen = render(
            <ScreenChromeFrame testID="frame" accessibilityRole="none" pointerEvents="box-none">
                <Text>Content</Text>
            </ScreenChromeFrame>
        );
        const frame = screen.getByTestId('frame');

        expect(frame).toHaveProp('accessibilityRole', 'none');
        expect(frame).toHaveProp('pointerEvents', 'box-none');
    });

    it('lets consumer styles override the full-screen layout defaults', () => {
        expect.hasAssertions();

        const screen = render(
            <ScreenChromeFrame testID="frame" style={{ flex: CONSUMER_FLEX, backgroundColor: 'red' }}>
                <Text>Content</Text>
            </ScreenChromeFrame>
        );
        const frame = screen.getByTestId('frame');

        expect(frame).toHaveStyle({ flex: CONSUMER_FLEX, backgroundColor: 'red', position: 'relative' });
    });
});
