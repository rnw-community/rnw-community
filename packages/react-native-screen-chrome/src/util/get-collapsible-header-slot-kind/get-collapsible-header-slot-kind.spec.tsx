import { describe, expect, it } from '@jest/globals';
import React, { memo } from 'react';
import { Text, View } from 'react-native';

import { CollapsibleHeaderSlot } from '../../collapsible-header-slot/collapsible-header-slot';
import { CollapsibleHeaderTitleSlot } from '../../collapsible-header-title-slot/collapsible-header-title-slot';

import { getCollapsibleHeaderSlotKind } from './get-collapsible-header-slot-kind.util';

import type { ReactNode } from 'react';

const DuplicateModuleControlSlot = ({ children }: { readonly children?: ReactNode }): ReactNode => <View>{children}</View>;
DuplicateModuleControlSlot.screenChromeSlotKind = 'control' as const;

const DuplicateModuleTitleSlot = ({ children }: { readonly children?: ReactNode }): ReactNode => <View>{children}</View>;
DuplicateModuleTitleSlot.screenChromeSlotKind = 'title' as const;

const ForeignMarkedComponent = (): ReactNode => null;
ForeignMarkedComponent.screenChromeSlotKind = 'leading';

describe('getCollapsibleHeaderSlotKind', () => {
    it('exposes stable string markers on the public slot components', () => {
        expect.hasAssertions();

        expect(CollapsibleHeaderSlot.screenChromeSlotKind).toBe('control');
        expect(CollapsibleHeaderTitleSlot.screenChromeSlotKind).toBe('title');
    });

    it('resolves the public slot components through their marker', () => {
        expect.hasAssertions();

        expect(getCollapsibleHeaderSlotKind(<CollapsibleHeaderSlot />)).toBe('control');
        expect(getCollapsibleHeaderSlotKind(<CollapsibleHeaderTitleSlot>Title</CollapsibleHeaderTitleSlot>)).toBe('title');
    });

    it('resolves slot components from a duplicate module copy through the marker', () => {
        expect.hasAssertions();

        expect(getCollapsibleHeaderSlotKind(<DuplicateModuleControlSlot />)).toBe('control');
        expect(getCollapsibleHeaderSlotKind(<DuplicateModuleTitleSlot />)).toBe('title');
    });

    it('returns undefined for host, fragment, unmarked, and foreign-marked element types', () => {
        expect.hasAssertions();

        expect(getCollapsibleHeaderSlotKind(<View />)).toBeUndefined();
        expect(getCollapsibleHeaderSlotKind(<Text>Title</Text>)).toBeUndefined();
        expect(getCollapsibleHeaderSlotKind(<>fragment</>)).toBeUndefined();
        expect(getCollapsibleHeaderSlotKind(React.createElement('RCTView'))).toBeUndefined();
        expect(getCollapsibleHeaderSlotKind(React.createElement(memo(CollapsibleHeaderSlot)))).toBeUndefined();
        expect(getCollapsibleHeaderSlotKind(<ForeignMarkedComponent />)).toBeUndefined();
    });
});
