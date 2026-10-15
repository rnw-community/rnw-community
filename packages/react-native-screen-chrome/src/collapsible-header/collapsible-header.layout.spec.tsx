import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { render } from '@testing-library/react-native';
import React, { Children } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { CollapsibleHeader as GenericCollapsibleHeader } from '@rnw-community/react-native-collapsible-header';
import { isDefined } from '@rnw-community/shared';

import { CollapsibleHeaderSlot } from '../collapsible-header-slot/collapsible-header-slot';
import { CollapsibleHeaderTitleSlot } from '../collapsible-header-title-slot/collapsible-header-title-slot';
import { SCREEN_CHROME_DEFAULT_CONFIG } from '../constant/screen-chrome-default-config.constant';

import { CollapsibleHeader } from './collapsible-header';

import type { ScreenChromeConfigInterface } from '../interface/screen-chrome-config.interface';
import type { ReactElement, ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';

const DEFAULT_MOCK_CONFIG: ScreenChromeConfigInterface = { ...SCREEN_CHROME_DEFAULT_CONFIG, snapToCollapse: true };
const COLLAPSED_HEADER_HEIGHT = 44;
const mockTopInset = 59;
let mockConfig = DEFAULT_MOCK_CONFIG;

jest.mock('@rnw-community/react-native-collapsible-header', () => ({ CollapsibleHeader: jest.fn(() => null) }));
jest.mock('react-native-safe-area-context', () => ({
    useSafeAreaInsets: () => ({ top: mockTopInset, right: 0, bottom: 0, left: 0 }),
}));
jest.mock('../hooks/use-screen-chrome/use-screen-chrome.hook', () => ({
    useScreenChrome: () => ({ config: mockConfig }),
}));

const fullHeaderChildren = [
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

const renderWithChildren = (children: ReactNode) => {
    render(<CollapsibleHeader>{children}</CollapsibleHeader>);

    const [props] = jest.mocked(GenericCollapsibleHeader).mock.calls[0] ?? [];

    if (!isDefined(props)) {
        throw new Error('Generic collapsible header was not rendered');
    }

    return props;
};

const getPersistentRow = (persistentContent: ReactNode): ReactElement<{ children: ReactNode; style: StyleProp<ViewStyle> }> =>
    persistentContent as ReactElement<{ children: ReactNode; style: StyleProp<ViewStyle> }>;

describe('CollapsibleHeader split heights', () => {
    beforeEach(() => {
        jest.mocked(GenericCollapsibleHeader).mockClear();
        mockConfig = { ...DEFAULT_MOCK_CONFIG, collapsedHeaderHeight: COLLAPSED_HEADER_HEIGHT };
    });

    afterEach(() => {
        mockConfig = DEFAULT_MOCK_CONFIG;
    });

    it('collapses the container to the configured collapsed height below the safe area', () => {
        expect.hasAssertions();

        const props = renderWithChildren(fullHeaderChildren);

        expect(props.expandedHeight).toBe(mockTopInset + mockConfig.headerHeight);
        expect(props.collapsedHeight).toBe(mockTopInset + COLLAPSED_HEADER_HEIGHT);
        expect(props.collapseDistance).toBe(mockConfig.collapseEnd - mockConfig.collapseStart);
        expect(StyleSheet.flatten(props.collapsedContentContainerStyle).top).toBe(mockTopInset);
    });
});

describe('CollapsibleHeader optional control slots', () => {
    beforeEach(() => {
        jest.mocked(GenericCollapsibleHeader).mockClear();
    });

    it('keeps a lone trailing control right-aligned behind a vacant leading placeholder', () => {
        expect.hasAssertions();

        const props = renderWithChildren([
            <CollapsibleHeaderTitleSlot key="title">
                <Text>Large</Text>
                <Text>Small</Text>
            </CollapsibleHeaderTitleSlot>,
            <CollapsibleHeaderSlot key="trailing" testID="trailing">
                <Text>Menu</Text>
            </CollapsibleHeaderSlot>,
        ]);
        const row = getPersistentRow(props.persistentContent);
        const [placeholder, trailing] = Children.toArray(row.props.children) as ReactElement<{ testID?: string }>[];

        expect(StyleSheet.flatten(row.props.style).justifyContent).toBe('space-between');
        expect(placeholder).toEqual(expect.objectContaining({ type: View, props: { pointerEvents: 'none' } }));
        expect(trailing.props.testID).toBe('trailing');
    });

    it('fills both control positions with placeholders for a title-only header', () => {
        expect.hasAssertions();

        const props = renderWithChildren(
            <CollapsibleHeaderTitleSlot>
                <Text>Large</Text>
                <Text>Small</Text>
            </CollapsibleHeaderTitleSlot>
        );
        const rowChildren = Children.toArray(getPersistentRow(props.persistentContent).props.children);
        const controls = render(<>{props.persistentContent}</>);

        expect(rowChildren).toHaveLength(2);
        expect(rowChildren).toEqual([
            expect.objectContaining({ type: View, props: { pointerEvents: 'none' } }),
            expect.objectContaining({ type: View, props: { pointerEvents: 'none' } }),
        ]);
        expect(controls.toJSON()).toBeTruthy();
    });

    it('keeps a lone leading control first with a vacant trailing placeholder', () => {
        expect.hasAssertions();

        const props = renderWithChildren([
            <CollapsibleHeaderSlot key="leading" testID="leading">
                <Text>Back</Text>
            </CollapsibleHeaderSlot>,
            <CollapsibleHeaderTitleSlot key="title">
                <Text>Large</Text>
                <Text>Small</Text>
            </CollapsibleHeaderTitleSlot>,
        ]);
        const [leading, placeholder] = Children.toArray(
            getPersistentRow(props.persistentContent).props.children
        ) as ReactElement<{ testID?: string }>[];

        expect(leading.props.testID).toBe('leading');
        expect(placeholder).toEqual(expect.objectContaining({ type: View, props: { pointerEvents: 'none' } }));
    });
});
