import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { render } from '@testing-library/react-native';
import React from 'react';
import { StyleSheet, Text } from 'react-native';

import { CollapsibleHeader as GenericCollapsibleHeader } from '@rnw-community/react-native-collapsible-header';
import { isDefined } from '@rnw-community/shared';

import { CollapsibleHeaderSlot } from '../collapsible-header-slot/collapsible-header-slot';
import { CollapsibleHeaderTitleSlot } from '../collapsible-header-title-slot/collapsible-header-title-slot';
import { SCREEN_CHROME_DEFAULT_CONFIG } from '../constant/screen-chrome-default-config.constant';

import { CollapsibleHeader } from './collapsible-header';

const mockConfig = { ...SCREEN_CHROME_DEFAULT_CONFIG, snapToCollapse: true };
const mockTopInset = 59;

jest.mock('@rnw-community/react-native-collapsible-header', () => ({ CollapsibleHeader: jest.fn(() => null) }));
jest.mock('react-native-safe-area-context', () => ({
    useSafeAreaInsets: () => ({ top: mockTopInset, right: 0, bottom: 0, left: 0 }),
}));
jest.mock('../hooks/use-screen-chrome/use-screen-chrome.hook', () => ({
    useScreenChrome: () => ({ config: mockConfig }),
}));

describe('CollapsibleHeader', () => {
    beforeEach(() => {
        jest.mocked(GenericCollapsibleHeader).mockClear();
    });

    it('delegates geometry, title layers, and one persistent control row', () => {
        expect.hasAssertions();

        render(
            <CollapsibleHeader testID="chrome-header">
                <CollapsibleHeaderSlot>
                    <Text>Back</Text>
                </CollapsibleHeaderSlot>
                <CollapsibleHeaderTitleSlot>
                    <Text>Large</Text>
                    <Text>Small</Text>
                </CollapsibleHeaderTitleSlot>
                <CollapsibleHeaderSlot>
                    <Text>Menu</Text>
                </CollapsibleHeaderSlot>
            </CollapsibleHeader>
        );

        const [props] = jest.mocked(GenericCollapsibleHeader).mock.calls[0] ?? [];

        if (!isDefined(props)) {
            throw new Error('Generic collapsible header was not rendered');
        }

        const controls = render(<>{props.persistentContent}</>);

        expect(GenericCollapsibleHeader).toHaveBeenCalledTimes(1);
        expect(props).not.toHaveProperty('scrollY');
        expect(props).toEqual(
            expect.objectContaining({
                mode: 'overlay',
                snap: true,
                expandedHeight: mockTopInset + mockConfig.headerHeight,
                collapsedHeight: mockTopInset + mockConfig.headerHeight,
                collapseStart: mockConfig.collapseStart,
                collapseDistance: mockConfig.collapseEnd - mockConfig.collapseStart,
                headerStyle: { paddingTop: mockTopInset },
                motion: {
                    expandedOpacityEndProgress: 0.75,
                    collapsedOpacityStartProgress: 0.5,
                    backgroundOpacityStartProgress: 1,
                    pointerEventsSwitchProgress: 0.5,
                    expandedTranslateY: 0,
                    expandedScale: 1,
                    collapsedTranslateY: 0,
                },
            })
        );
        expect(controls.getAllByText('Back')).toHaveLength(1);
        expect(controls.getAllByText('Menu')).toHaveLength(1);
    });

    it('renders the public slot components', () => {
        expect.hasAssertions();

        const markers = render(
            <>
                <CollapsibleHeaderSlot>
                    <Text>Leading</Text>
                </CollapsibleHeaderSlot>
                <CollapsibleHeaderTitleSlot>
                    <Text>Expanded</Text>
                    <Text>Collapsed</Text>
                </CollapsibleHeaderTitleSlot>
                <CollapsibleHeaderSlot>
                    <Text>Trailing</Text>
                </CollapsibleHeaderSlot>
            </>
        );

        expect(markers.getByText('Leading')).toBeTruthy();
        expect(markers.getByText('Expanded')).toBeTruthy();
        expect(markers.getByText('Collapsed')).toBeTruthy();
        expect(markers.getByText('Trailing')).toBeTruthy();
    });
});

describe('CollapsibleHeader geometry', () => {
    beforeEach(() => {
        jest.mocked(GenericCollapsibleHeader).mockClear();
    });

    it('reserves the configured content height above the safe-area top inset', () => {
        expect.hasAssertions();

        render(
            <CollapsibleHeader>
                <CollapsibleHeaderSlot>
                    <Text>Back</Text>
                </CollapsibleHeaderSlot>
                <CollapsibleHeaderTitleSlot>
                    <Text>Large</Text>
                    <Text>Small</Text>
                </CollapsibleHeaderTitleSlot>
                <CollapsibleHeaderSlot>
                    <Text>Menu</Text>
                </CollapsibleHeaderSlot>
            </CollapsibleHeader>
        );

        const [props] = jest.mocked(GenericCollapsibleHeader).mock.calls[0] ?? [];

        if (!isDefined(props)) {
            throw new Error('Generic collapsible header was not rendered');
        }

        const headerPaddingTop = Number(StyleSheet.flatten(props.headerStyle).paddingTop);

        expect(headerPaddingTop).toBe(mockTopInset);
        expect(props.expandedHeight - headerPaddingTop).toBe(mockConfig.headerHeight);
        expect(props.collapsedHeight - headerPaddingTop).toBe(mockConfig.headerHeight);
    });
});
