import { describe, expect, it } from '@jest/globals';
import React from 'react';
import { Text } from 'react-native';

import { CollapsibleHeaderSlot } from '../collapsible-header-slot/collapsible-header-slot.js';
import { CollapsibleHeaderTitleSlot } from '../collapsible-header-title-slot/collapsible-header-title-slot.js';

import { getCollapsibleHeaderSlots } from './get-collapsible-header-slots.util.js';

const createValidChildren = () => [
    <CollapsibleHeaderSlot key="leading">
        <Text>Back</Text>
    </CollapsibleHeaderSlot>,
    <CollapsibleHeaderTitleSlot key="title">
        <Text>Large</Text>
        <Text>Small</Text>
    </CollapsibleHeaderTitleSlot>,
    <CollapsibleHeaderSlot key="trailing">
        <Text>Menu</Text>
    </CollapsibleHeaderSlot>,
];

describe('getCollapsibleHeaderSlots', () => {
    it('extracts the documented direct child slots', () => {
        expect.hasAssertions();

        const validChildren = createValidChildren();
        const slots = getCollapsibleHeaderSlots(validChildren);

        expect(slots.leading).toEqual(expect.objectContaining({ type: CollapsibleHeaderSlot }));
        expect(slots.trailing).toEqual(expect.objectContaining({ type: CollapsibleHeaderSlot }));
        expect(slots.expandedTitle).toBeDefined();
        expect(slots.collapsedTitle).toBeDefined();
    });

    it('rejects invalid top-level slot structure', () => {
        expect.hasAssertions();

        expect(() => getCollapsibleHeaderSlots('invalid')).toThrow(
            'CollapsibleHeader requires leading, title, and trailing direct children'
        );
        expect(() => getCollapsibleHeaderSlots(<>{createValidChildren()}</>)).toThrow(
            'CollapsibleHeader requires leading, title, and trailing direct children'
        );
        expect(() =>
            getCollapsibleHeaderSlots([
                <CollapsibleHeaderSlot key="leading" />,
                <CollapsibleHeaderSlot key="wrong-title" />,
                <CollapsibleHeaderTitleSlot key="wrong-trailing">Title</CollapsibleHeaderTitleSlot>,
            ])
        ).toThrow('CollapsibleHeader requires leading, title, and trailing direct children');
    });

    it('rejects missing top-level and title slots', () => {
        expect.hasAssertions();

        expect(() => getCollapsibleHeaderSlots(<CollapsibleHeaderSlot />)).toThrow(
            'CollapsibleHeader requires leading, title, and trailing direct children'
        );
        expect(() =>
            getCollapsibleHeaderSlots([
                <CollapsibleHeaderSlot key="leading" />,
                <CollapsibleHeaderTitleSlot key="title">Large</CollapsibleHeaderTitleSlot>,
                <CollapsibleHeaderSlot key="trailing" />,
            ])
        ).toThrow('CollapsibleHeader requires expanded and collapsed title direct children');
    });

    it('rejects an invalid number of title layers', () => {
        expect.hasAssertions();

        expect(() =>
            getCollapsibleHeaderSlots([
                <CollapsibleHeaderSlot key="leading" />,
                <CollapsibleHeaderTitleSlot key="title">
                    <Text>Wrapped</Text>
                </CollapsibleHeaderTitleSlot>,
                <CollapsibleHeaderSlot key="trailing" />,
            ])
        ).toThrow('CollapsibleHeader requires expanded and collapsed title direct children');
        expect(() =>
            getCollapsibleHeaderSlots([
                <CollapsibleHeaderSlot key="leading" />,
                <CollapsibleHeaderTitleSlot key="title">
                    <Text>First</Text>
                    <Text>Second</Text>
                    <Text>Third</Text>
                </CollapsibleHeaderTitleSlot>,
                <CollapsibleHeaderSlot key="trailing" />,
            ])
        ).toThrow('CollapsibleHeader requires expanded and collapsed title direct children');
    });
});
