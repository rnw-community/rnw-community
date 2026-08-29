import { describe, expect, it, jest } from '@jest/globals';
import { render, screen } from '@testing-library/react-native';
import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { getAnimatedStyle } from 'react-native-reanimated';

import { CollapsibleHeaderProvider } from '@rnw-community/react-native-collapsible-header';

import { CollapsibleHeaderSlot } from '../collapsible-header-slot/collapsible-header-slot';
import { CollapsibleHeaderTitleSlot } from '../collapsible-header-title-slot/collapsible-header-title-slot';
import { SCREEN_CHROME_DEFAULT_CONFIG } from '../constant/screen-chrome-default-config.constant';

import { CollapsibleHeader } from './collapsible-header';

import type { StyleProp, ViewStyle } from 'react-native';

const mockConfig = { ...SCREEN_CHROME_DEFAULT_CONFIG, snapToCollapse: true };
const mockTopInset = 12;

jest.mock('react-native-safe-area-context', () => ({
    useSafeAreaInsets: () => ({ top: mockTopInset, right: 0, bottom: 0, left: 0 }),
}));
jest.mock('../hooks/use-screen-chrome/use-screen-chrome.hook', () => ({
    useScreenChrome: () => ({ config: mockConfig }),
}));

describe('CollapsibleHeader integration', () => {
    it('mounts title and control slots once through the provider-driven generic header', () => {
        expect.hasAssertions();

        render(
            <CollapsibleHeaderProvider>
                <CollapsibleHeader testID="chrome-header">
                    <CollapsibleHeaderSlot>
                        <Text>Back</Text>
                    </CollapsibleHeaderSlot>
                    <CollapsibleHeaderTitleSlot>
                        <Text>Expanded</Text>
                        <Text>Collapsed</Text>
                    </CollapsibleHeaderTitleSlot>
                    <CollapsibleHeaderSlot>
                        <Text>Menu</Text>
                    </CollapsibleHeaderSlot>
                </CollapsibleHeader>
            </CollapsibleHeaderProvider>
        );

        expect(screen.getAllByText('Back')).toHaveLength(1);
        expect(screen.getAllByText('Menu')).toHaveLength(1);
        expect(screen.getAllByText('Expanded')).toHaveLength(1);
        expect(screen.getAllByText('Collapsed', { includeHiddenElements: true })).toHaveLength(1);
    });

    it('lays every rendered content layer out in the header band below the top inset', () => {
        expect.hasAssertions();

        render(
            <CollapsibleHeaderProvider>
                <CollapsibleHeader testID="chrome-header">
                    <CollapsibleHeaderSlot>
                        <Text>Back</Text>
                    </CollapsibleHeaderSlot>
                    <CollapsibleHeaderTitleSlot>
                        <Text>Expanded</Text>
                        <Text>Collapsed</Text>
                    </CollapsibleHeaderTitleSlot>
                    <CollapsibleHeaderSlot>
                        <Text>Menu</Text>
                    </CollapsibleHeaderSlot>
                </CollapsibleHeader>
            </CollapsibleHeaderProvider>
        );
        const getLayerStyle = (layer: string): ViewStyle =>
            StyleSheet.flatten(
                (
                    screen.getByTestId(`chrome-header-${layer}`, { includeHiddenElements: true }).props as {
                        style: StyleProp<ViewStyle>;
                    }
                ).style
            );

        expect(getAnimatedStyle(screen.getByTestId('chrome-header-header')).height).toBe(
            mockTopInset + mockConfig.headerHeight
        );
        expect(getLayerStyle('expanded').top).toBe(mockTopInset);
        expect(getLayerStyle('collapsed').top).toBe(mockTopInset);
        expect(getLayerStyle('persistent').top).toBe(mockTopInset);
        expect(getLayerStyle('header').paddingTop).toBeUndefined();
    });
});
