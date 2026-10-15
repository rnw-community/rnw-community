import { describe, expect, it, jest } from '@jest/globals';
import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import { Pressable, Text } from 'react-native';

import { CollapsibleHeaderSlot } from './collapsible-header-slot';

describe('CollapsibleHeaderSlot', () => {
    it('keeps the touch target at the platform minimum and above the title layers', () => {
        expect.hasAssertions();

        const { getByTestId } = render(
            <CollapsibleHeaderSlot testID="leading-slot">
                <Text>Back</Text>
            </CollapsibleHeaderSlot>
        );

        expect(getByTestId('leading-slot')).toHaveStyle({ minWidth: 44, minHeight: 44 });
    });

    it('renders its content', () => {
        expect.hasAssertions();

        const { getByText } = render(
            <CollapsibleHeaderSlot>
                <Text>Back</Text>
            </CollapsibleHeaderSlot>
        );

        expect(getByText('Back')).toBeTruthy();
    });

    it('lets touches outside its children reach the layers underneath', () => {
        expect.hasAssertions();

        const { getByTestId } = render(<CollapsibleHeaderSlot testID="empty-slot" />);

        expect(getByTestId('empty-slot')).toHaveProp('pointerEvents', 'box-none');
    });

    it('merges consumer styles after the slot defaults', () => {
        expect.hasAssertions();

        const { getByTestId } = render(<CollapsibleHeaderSlot style={{ minWidth: 88, marginLeft: 8 }} testID="wide-slot" />);

        expect(getByTestId('wide-slot')).toHaveStyle({ minWidth: 88, minHeight: 44, marginLeft: 8 });
    });

    it('still delivers presses to the control inside the slot', () => {
        expect.hasAssertions();

        const onPress = jest.fn();
        const { getByText } = render(
            <CollapsibleHeaderSlot>
                <Pressable accessibilityRole="button" onPress={onPress}>
                    <Text>Back</Text>
                </Pressable>
            </CollapsibleHeaderSlot>
        );

        fireEvent.press(getByText('Back'));

        expect(onPress).toHaveBeenCalledTimes(1);
    });
});
