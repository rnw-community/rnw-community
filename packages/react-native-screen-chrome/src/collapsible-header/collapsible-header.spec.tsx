import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { render } from '@testing-library/react-native';
import React from 'react';
import { StyleSheet, Text } from 'react-native';

import { CollapsibleHeader as GenericCollapsibleHeader } from '@rnw-community/react-native-collapsible-header';
import { isDefined } from '@rnw-community/shared';

import { CollapsibleHeaderSlot } from '../collapsible-header-slot/collapsible-header-slot';
import { CollapsibleHeaderTitleSlot } from '../collapsible-header-title-slot/collapsible-header-title-slot';
import { SCREEN_CHROME_DEFAULT_CONFIG } from '../constant/screen-chrome-default-config.constant';

import { CollapsibleHeader } from './collapsible-header';

import type { StyleProp, ViewStyle } from 'react-native';

const mockConfig = { ...SCREEN_CHROME_DEFAULT_CONFIG, snapToCollapse: true };
const DEVICE_TOP_INSET = 59;
const NO_TOP_INSET = 0;
let mockTopInset = DEVICE_TOP_INSET;

jest.mock('@rnw-community/react-native-collapsible-header', () => ({ CollapsibleHeader: jest.fn(() => null) }));
jest.mock('react-native-safe-area-context', () => ({
    useSafeAreaInsets: () => ({ top: mockTopInset, right: 0, bottom: 0, left: 0 }),
}));
jest.mock('../hooks/use-screen-chrome/use-screen-chrome.hook', () => ({
    useScreenChrome: () => ({ config: mockConfig }),
}));

const renderDelegatedProps = (motion?: {
    readonly backgroundOpacityStartProgress: number;
    readonly expandedScale: number;
}) => {
    render(
        <CollapsibleHeader testID="chrome-header" motion={motion}>
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

    return props;
};

const renderWithContainerStyles = (containerStyles: {
    readonly expandedContentContainerStyle?: StyleProp<ViewStyle>;
    readonly collapsedContentContainerStyle?: StyleProp<ViewStyle>;
    readonly persistentContentContainerStyle?: StyleProp<ViewStyle>;
}) => {
    render(
        <CollapsibleHeader {...containerStyles}>
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

    return props;
};

describe('CollapsibleHeader', () => {
    beforeEach(() => {
        jest.mocked(GenericCollapsibleHeader).mockClear();
    });

    it('delegates geometry, title layers, and one persistent control row', () => {
        expect.hasAssertions();

        const props = renderDelegatedProps();
        const controls = render(<>{props.persistentContent}</>);

        expect(GenericCollapsibleHeader).toHaveBeenCalledTimes(1);
        expect(props).not.toHaveProperty('scrollY');
        expect(props).toEqual(
            expect.objectContaining({
                testID: 'chrome-header',
                mode: 'overlay',
                snap: true,
                expandedHeight: mockTopInset + mockConfig.headerHeight,
                collapsedHeight: mockTopInset + mockConfig.headerHeight,
                collapseStart: mockConfig.collapseStart,
                collapseDistance: mockConfig.collapseEnd - mockConfig.collapseStart,
                motion: {
                    expandedOpacityEndProgress: 0.75,
                    collapsedOpacityStartProgress: 0.5,
                    backgroundOpacityStartProgress: 1,
                    expandedTranslateY: 0,
                    expandedScale: 1,
                    collapsedTranslateY: 0,
                },
            })
        );
        expect(controls.getAllByText('Back')).toHaveLength(1);
        expect(controls.getAllByText('Menu')).toHaveLength(1);
    });

    it('starts every content layer below the safe-area top inset', () => {
        expect.hasAssertions();

        const props = renderDelegatedProps();
        const expandedTop = Number(StyleSheet.flatten(props.expandedContentContainerStyle).top);
        const collapsedTop = Number(StyleSheet.flatten(props.collapsedContentContainerStyle).top);
        const persistentTop = Number(StyleSheet.flatten(props.persistentContentContainerStyle).top);

        expect(expandedTop).toBe(mockTopInset);
        expect(collapsedTop).toBe(mockTopInset);
        expect(persistentTop).toBe(mockTopInset);
        expect(props.expandedHeight - expandedTop).toBe(mockConfig.headerHeight);
        expect(props.collapsedHeight - collapsedTop).toBe(mockConfig.headerHeight);
    });

    it('lets the motion override win over derived windows while the rest stays config-driven', () => {
        expect.hasAssertions();

        const props = renderDelegatedProps({ backgroundOpacityStartProgress: 0.7, expandedScale: 0.9 });

        expect(props.motion).toEqual({
            expandedOpacityEndProgress: 0.75,
            collapsedOpacityStartProgress: 0.5,
            backgroundOpacityStartProgress: 0.7,
            expandedTranslateY: 0,
            expandedScale: 0.9,
            collapsedTranslateY: 0,
        });
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

describe('CollapsibleHeader content container styles', () => {
    beforeEach(() => {
        jest.mocked(GenericCollapsibleHeader).mockClear();
    });

    it('centers both title layers behind the control gutter when no container style is given', () => {
        expect.hasAssertions();

        const props = renderWithContainerStyles({});

        expect(StyleSheet.flatten(props.expandedContentContainerStyle)).toEqual({
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: 72,
            top: mockTopInset,
        });
        expect(StyleSheet.flatten(props.collapsedContentContainerStyle)).toEqual({
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: 72,
            top: mockTopInset,
        });
        expect(StyleSheet.flatten(props.persistentContentContainerStyle)).toEqual({ top: mockTopInset });
    });

    it('lets a consumer container style override the derived title layer for a left-aligned large title', () => {
        expect.hasAssertions();

        const props = renderWithContainerStyles({
            expandedContentContainerStyle: { alignItems: 'flex-start', paddingHorizontal: 16 },
        });
        const expanded = StyleSheet.flatten(props.expandedContentContainerStyle);

        expect(expanded.alignItems).toBe('flex-start');
        expect(expanded.paddingHorizontal).toBe(16);
        expect(expanded.justifyContent).toBe('center');
        expect(StyleSheet.flatten(props.collapsedContentContainerStyle).alignItems).toBe('center');
    });

    it('forwards the persistent container style straight through to the primitive', () => {
        expect.hasAssertions();

        const props = renderWithContainerStyles({ persistentContentContainerStyle: { paddingHorizontal: 8 } });

        expect(StyleSheet.flatten(props.persistentContentContainerStyle)).toEqual({
            paddingHorizontal: 8,
            top: mockTopInset,
        });
    });
});

describe('CollapsibleHeader without a safe-area top inset', () => {
    beforeEach(() => {
        jest.mocked(GenericCollapsibleHeader).mockClear();
        mockTopInset = NO_TOP_INSET;
    });

    afterEach(() => {
        mockTopInset = DEVICE_TOP_INSET;
    });

    it('keeps the content layers flush with the header container', () => {
        expect.hasAssertions();

        const props = renderDelegatedProps();

        expect(props.expandedHeight).toBe(mockConfig.headerHeight);
        expect(StyleSheet.flatten(props.expandedContentContainerStyle).top).toBe(NO_TOP_INSET);
        expect(StyleSheet.flatten(props.collapsedContentContainerStyle).top).toBe(NO_TOP_INSET);
        expect(StyleSheet.flatten(props.persistentContentContainerStyle).top).toBe(NO_TOP_INSET);
    });
});
