import { describe, expect, it } from '@jest/globals';
import React from 'react';
import { Text } from 'react-native';

import { CollapsibleHeaderLargeTitle } from '../collapsible-header-large-title/collapsible-header-large-title.js';
import { CollapsibleHeaderLeading } from '../collapsible-header-leading/collapsible-header-leading.js';
import { CollapsibleHeaderSmallTitle } from '../collapsible-header-small-title/collapsible-header-small-title.js';
import { CollapsibleHeaderTitleSlot } from '../collapsible-header-title-slot/collapsible-header-title-slot.js';
import { CollapsibleHeaderTrailing } from '../collapsible-header-trailing/collapsible-header-trailing.js';

import { getCollapsibleHeaderSlots } from './get-collapsible-header-slots.util.js';

const createValidChildren = () => [
    <CollapsibleHeaderLeading key="leading">
        <Text>Back</Text>
    </CollapsibleHeaderLeading>,
    <CollapsibleHeaderTitleSlot key="title">
        <CollapsibleHeaderLargeTitle>
            <Text>Large</Text>
        </CollapsibleHeaderLargeTitle>
        <CollapsibleHeaderSmallTitle>
            <Text>Small</Text>
        </CollapsibleHeaderSmallTitle>
    </CollapsibleHeaderTitleSlot>,
    <CollapsibleHeaderTrailing key="trailing">
        <Text>Menu</Text>
    </CollapsibleHeaderTrailing>,
];

describe('getCollapsibleHeaderSlots', () => {
    it('extracts the documented direct child slots', () => {
        expect.hasAssertions();

        const validChildren = createValidChildren();
        const slots = getCollapsibleHeaderSlots(validChildren);

        expect(slots.leading).toEqual(expect.objectContaining({ type: CollapsibleHeaderLeading }));
        expect(slots.trailing).toEqual(expect.objectContaining({ type: CollapsibleHeaderTrailing }));
        expect(slots.expandedTitle).toBeDefined();
        expect(slots.collapsedTitle).toBeDefined();
    });

    it('rejects wrapper and duplicate top-level slots', () => {
        expect.hasAssertions();

        expect(() => getCollapsibleHeaderSlots('invalid')).toThrow('CollapsibleHeader slots must be direct children');
        expect(() => getCollapsibleHeaderSlots(<>{createValidChildren()}</>)).toThrow(
            'CollapsibleHeader slots must be direct children'
        );
        expect(() =>
            getCollapsibleHeaderSlots([<CollapsibleHeaderLeading key="first" />, <CollapsibleHeaderLeading key="second" />])
        ).toThrow('CollapsibleHeader slots must be direct children');
    });

    it('rejects missing top-level and title slots', () => {
        expect.hasAssertions();

        expect(() => getCollapsibleHeaderSlots(<CollapsibleHeaderLeading />)).toThrow(
            'CollapsibleHeader requires leading, title, and trailing direct children'
        );
        expect(() =>
            getCollapsibleHeaderSlots([
                <CollapsibleHeaderLeading key="leading" />,
                <CollapsibleHeaderTitleSlot key="title">
                    <CollapsibleHeaderLargeTitle>Large</CollapsibleHeaderLargeTitle>
                </CollapsibleHeaderTitleSlot>,
                <CollapsibleHeaderTrailing key="trailing" />,
            ])
        ).toThrow('CollapsibleHeader requires one large and one small title');
    });

    it('rejects invalid and duplicate title layers', () => {
        expect.hasAssertions();

        expect(() =>
            getCollapsibleHeaderSlots([
                <CollapsibleHeaderLeading key="leading" />,
                <CollapsibleHeaderTitleSlot key="title">invalid</CollapsibleHeaderTitleSlot>,
                <CollapsibleHeaderTrailing key="trailing" />,
            ])
        ).toThrow('CollapsibleHeader title layers must be direct children');
        expect(() =>
            getCollapsibleHeaderSlots([
                <CollapsibleHeaderLeading key="leading" />,
                <CollapsibleHeaderTitleSlot key="title">
                    <Text>Wrapped</Text>
                </CollapsibleHeaderTitleSlot>,
                <CollapsibleHeaderTrailing key="trailing" />,
            ])
        ).toThrow('CollapsibleHeader title layers must be direct children');
        expect(() =>
            getCollapsibleHeaderSlots([
                <CollapsibleHeaderLeading key="leading" />,
                <CollapsibleHeaderTitleSlot key="title">
                    <CollapsibleHeaderLargeTitle>First</CollapsibleHeaderLargeTitle>
                    <CollapsibleHeaderLargeTitle>Second</CollapsibleHeaderLargeTitle>
                </CollapsibleHeaderTitleSlot>,
                <CollapsibleHeaderTrailing key="trailing" />,
            ])
        ).toThrow('CollapsibleHeader title layers must be direct children');
    });
});
