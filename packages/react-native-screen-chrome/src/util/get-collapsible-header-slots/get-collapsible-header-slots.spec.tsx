import { describe, expect, it } from '@jest/globals';
import React from 'react';
import { Text, View } from 'react-native';

import { CollapsibleHeaderSlot } from '../../collapsible-header-slot/collapsible-header-slot';
import { CollapsibleHeaderTitleSlot } from '../../collapsible-header-title-slot/collapsible-header-title-slot';

import { getCollapsibleHeaderSlots } from './get-collapsible-header-slots.util';

import type { ReactNode } from 'react';

const UNKNOWN_CHILD_MESSAGE = 'CollapsibleHeader direct children must be CollapsibleHeaderSlot or CollapsibleHeaderTitleSlot';
const MISSING_TITLE_MESSAGE = 'CollapsibleHeader requires a CollapsibleHeaderTitleSlot direct child';
const TITLE_LAYERS_MESSAGE = 'CollapsibleHeader requires expanded and collapsed title direct children';

const DuplicateModuleControlSlot = ({ children }: { readonly children?: ReactNode }): ReactNode => <View>{children}</View>;
DuplicateModuleControlSlot.screenChromeSlotKind = 'control' as const;

const DuplicateModuleTitleSlot = ({ children }: { readonly children?: ReactNode }): ReactNode => <View>{children}</View>;
DuplicateModuleTitleSlot.screenChromeSlotKind = 'title' as const;

const titleSlot = (
    <CollapsibleHeaderTitleSlot key="title">
        <Text>Large</Text>
        <Text>Small</Text>
    </CollapsibleHeaderTitleSlot>
);
const leadingSlot = (
    <CollapsibleHeaderSlot key="leading" testID="leading">
        <Text>Back</Text>
    </CollapsibleHeaderSlot>
);
const trailingSlot = (
    <CollapsibleHeaderSlot key="trailing" testID="trailing">
        <Text>Menu</Text>
    </CollapsibleHeaderSlot>
);

describe('getCollapsibleHeaderSlots', () => {
    it('extracts leading, title layers, and trailing from the full compound shape', () => {
        expect.hasAssertions();

        const slots = getCollapsibleHeaderSlots([leadingSlot, titleSlot, trailingSlot]);

        expect(slots.leading).toEqual(expect.objectContaining({ props: expect.objectContaining({ testID: 'leading' }) }));
        expect(slots.trailing).toEqual(expect.objectContaining({ props: expect.objectContaining({ testID: 'trailing' }) }));
        expect(slots.expandedTitle).toEqual(expect.objectContaining({ props: { children: 'Large' } }));
        expect(slots.collapsedTitle).toEqual(expect.objectContaining({ props: { children: 'Small' } }));
    });

    it('accepts a lone title slot with neither control slot', () => {
        expect.hasAssertions();

        const slots = getCollapsibleHeaderSlots(titleSlot);

        expect(slots.leading).toBeUndefined();
        expect(slots.trailing).toBeUndefined();
        expect(slots.expandedTitle).toBeDefined();
        expect(slots.collapsedTitle).toBeDefined();
    });

    it('treats a control slot before the title as leading and after it as trailing', () => {
        expect.hasAssertions();

        const leadingOnly = getCollapsibleHeaderSlots([leadingSlot, titleSlot]);
        const trailingOnly = getCollapsibleHeaderSlots([titleSlot, trailingSlot]);

        expect(leadingOnly.leading).toBeDefined();
        expect(leadingOnly.trailing).toBeUndefined();
        expect(trailingOnly.leading).toBeUndefined();
        expect(trailingOnly.trailing).toBeDefined();
    });

    it('ignores conditionally omitted children', () => {
        expect.hasAssertions();

        const slots = getCollapsibleHeaderSlots([null, titleSlot, false, void 0, trailingSlot]);

        expect(slots.leading).toBeUndefined();
        expect(slots.trailing).toBeDefined();
    });

    it('matches slot components from a duplicate module copy by their marker', () => {
        expect.hasAssertions();

        const slots = getCollapsibleHeaderSlots([
            <DuplicateModuleControlSlot key="leading" />,
            <DuplicateModuleTitleSlot key="title">
                <Text>Large</Text>
                <Text>Small</Text>
            </DuplicateModuleTitleSlot>,
            <DuplicateModuleControlSlot key="trailing" />,
        ]);

        expect(slots.leading).toEqual(expect.objectContaining({ type: DuplicateModuleControlSlot }));
        expect(slots.trailing).toEqual(expect.objectContaining({ type: DuplicateModuleControlSlot }));
        expect(slots.expandedTitle).toBeDefined();
    });
});

describe('getCollapsibleHeaderSlots validation', () => {
    it('rejects unknown child types', () => {
        expect.hasAssertions();

        expect(() => getCollapsibleHeaderSlots('invalid')).toThrow(UNKNOWN_CHILD_MESSAGE);
        expect(() => getCollapsibleHeaderSlots([titleSlot, <View key="view" />])).toThrow(UNKNOWN_CHILD_MESSAGE);
        expect(() => getCollapsibleHeaderSlots(<>{[leadingSlot, titleSlot, trailingSlot]}</>)).toThrow(
            UNKNOWN_CHILD_MESSAGE
        );
    });

    it('rejects a missing title slot', () => {
        expect.hasAssertions();

        expect(() => getCollapsibleHeaderSlots(leadingSlot)).toThrow(MISSING_TITLE_MESSAGE);
        expect(() => getCollapsibleHeaderSlots(null)).toThrow(MISSING_TITLE_MESSAGE);
    });

    it('rejects duplicate slots in the same position', () => {
        expect.hasAssertions();

        expect(() => getCollapsibleHeaderSlots([titleSlot, titleSlot])).toThrow(
            'CollapsibleHeader accepts at most one CollapsibleHeaderTitleSlot'
        );
        expect(() => getCollapsibleHeaderSlots([leadingSlot, leadingSlot, titleSlot])).toThrow(
            'CollapsibleHeader accepts at most one leading CollapsibleHeaderSlot'
        );
        expect(() => getCollapsibleHeaderSlots([titleSlot, trailingSlot, trailingSlot])).toThrow(
            'CollapsibleHeader accepts at most one trailing CollapsibleHeaderSlot'
        );
    });

    it('rejects an invalid number of title layers', () => {
        expect.hasAssertions();

        expect(() =>
            getCollapsibleHeaderSlots(<CollapsibleHeaderTitleSlot>Large</CollapsibleHeaderTitleSlot>)
        ).toThrow(TITLE_LAYERS_MESSAGE);
        expect(() =>
            getCollapsibleHeaderSlots(
                <CollapsibleHeaderTitleSlot>
                    <Text>First</Text>
                    <Text>Second</Text>
                    <Text>Third</Text>
                </CollapsibleHeaderTitleSlot>
            )
        ).toThrow(TITLE_LAYERS_MESSAGE);
    });
});
