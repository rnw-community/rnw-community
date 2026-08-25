import { describe, expect, it } from '@jest/globals';
import { render } from '@testing-library/react-native';
import React from 'react';
import { Text } from 'react-native';

import { CollapsibleHeaderTitleSlot } from './collapsible-header-title-slot';

describe('CollapsibleHeaderTitleSlot', () => {
    it('renders both title layers without intercepting touches', () => {
        expect.hasAssertions();

        const { getByText, getByTestId } = render(
            <CollapsibleHeaderTitleSlot testID="title-slot">
                <Text>Large</Text>
                <Text>Small</Text>
            </CollapsibleHeaderTitleSlot>
        );

        expect(getByText('Large')).toBeTruthy();
        expect(getByText('Small')).toBeTruthy();
        expect(getByTestId('title-slot')).toHaveProp('pointerEvents', 'box-none');
    });

    it('keeps the title layers above the content and fills the persistent row', () => {
        expect.hasAssertions();

        const { getByTestId } = render(
            <CollapsibleHeaderTitleSlot testID="title-slot">
                <Text>Large</Text>
                <Text>Small</Text>
            </CollapsibleHeaderTitleSlot>
        );

        expect(getByTestId('title-slot')).toHaveStyle({ flex: 1 });
    });
});
