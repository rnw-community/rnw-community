import { describe, expect, it } from '@jest/globals';
import { render } from '@testing-library/react-native';
import React from 'react';
import { Text } from 'react-native';

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
});
