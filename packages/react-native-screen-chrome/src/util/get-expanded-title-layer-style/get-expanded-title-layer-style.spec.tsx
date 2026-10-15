import { describe, expect, it } from '@jest/globals';
import React from 'react';
import { Text } from 'react-native';

import { CollapsibleHeaderSlot } from '../../collapsible-header-slot/collapsible-header-slot';
import { SCREEN_CHROME_HEADER_LAYOUT_METRICS } from '../../constant/screen-chrome-header-layout-metrics.constant';

import { getExpandedTitleLayerStyle } from './get-expanded-title-layer-style.util';

const { rowPadding, slotSize, titleInset } = SCREEN_CHROME_HEADER_LAYOUT_METRICS;

const filledSlot = (
    <CollapsibleHeaderSlot>
        <Text>Back</Text>
    </CollapsibleHeaderSlot>
);
const emptySlot = <CollapsibleHeaderSlot />;

describe('getExpandedTitleLayerStyle', () => {
    it('centers the title between symmetric title insets by default', () => {
        expect.hasAssertions();

        expect(getExpandedTitleLayerStyle('center', filledSlot, emptySlot)).toStrictEqual({
            alignItems: 'center',
            paddingHorizontal: titleInset,
        });
    });

    it('keeps a start-aligned title clear of both filled slots', () => {
        expect.hasAssertions();

        expect(getExpandedTitleLayerStyle('start', filledSlot, filledSlot)).toStrictEqual({
            alignItems: 'stretch',
            paddingStart: rowPadding + slotSize,
            paddingEnd: rowPadding + slotSize,
        });
    });

    it('lets a start-aligned title use the space of empty slots', () => {
        expect.hasAssertions();

        expect(getExpandedTitleLayerStyle('start', emptySlot, filledSlot)).toStrictEqual({
            alignItems: 'stretch',
            paddingStart: rowPadding,
            paddingEnd: rowPadding + slotSize,
        });
        expect(getExpandedTitleLayerStyle('start', filledSlot, null)).toStrictEqual({
            alignItems: 'stretch',
            paddingStart: rowPadding + slotSize,
            paddingEnd: rowPadding,
        });
    });
});
