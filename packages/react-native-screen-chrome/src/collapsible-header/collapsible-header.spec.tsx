import { describe, expect, it, jest } from '@jest/globals';
import { render } from '@testing-library/react-native';
import React from 'react';
import { Text } from 'react-native';

import { CollapsibleHeader as GenericCollapsibleHeader } from '@rnw-community/react-native-collapsible-header';
import { isDefined } from '@rnw-community/shared';

import { CollapsibleHeaderLargeTitle } from '../collapsible-header-large-title/collapsible-header-large-title.js';
import { CollapsibleHeaderLeading } from '../collapsible-header-leading/collapsible-header-leading.js';
import { CollapsibleHeaderSmallTitle } from '../collapsible-header-small-title/collapsible-header-small-title.js';
import { CollapsibleHeaderTitleSlot } from '../collapsible-header-title-slot/collapsible-header-title-slot.js';
import { CollapsibleHeaderTrailing } from '../collapsible-header-trailing/collapsible-header-trailing.js';
import { SCREEN_CHROME_DEFAULT_CONFIG } from '../constant/screen-chrome-default-config.constant.js';

import { CollapsibleHeader } from './collapsible-header.js';

const mockScrollY = { get: jest.fn(() => 0), set: jest.fn() };
const mockConfig = SCREEN_CHROME_DEFAULT_CONFIG;

jest.mock('@rnw-community/react-native-collapsible-header', () => ({ CollapsibleHeader: jest.fn(() => null) }));
jest.mock('react-native-safe-area-context', () => ({
    useSafeAreaInsets: () => ({ top: 12, right: 0, bottom: 0, left: 0 }),
}));
jest.mock('../hook/use-screen-chrome.hook.js', () => ({
    useScreenChrome: () => ({ config: mockConfig, scrollY: mockScrollY }),
}));

describe('CollapsibleHeader', () => {
    it('delegates geometry, title layers, and one persistent control row', () => {
        expect.hasAssertions();

        render(
            <CollapsibleHeader testID="chrome-header">
                <CollapsibleHeaderLeading>
                    <Text>Back</Text>
                </CollapsibleHeaderLeading>
                <CollapsibleHeaderTitleSlot>
                    <CollapsibleHeaderLargeTitle>
                        <Text>Large</Text>
                    </CollapsibleHeaderLargeTitle>
                    <CollapsibleHeaderSmallTitle>
                        <Text>Small</Text>
                    </CollapsibleHeaderSmallTitle>
                </CollapsibleHeaderTitleSlot>
                <CollapsibleHeaderTrailing>
                    <Text>Menu</Text>
                </CollapsibleHeaderTrailing>
            </CollapsibleHeader>
        );

        const [props] = jest.mocked(GenericCollapsibleHeader).mock.calls[0] ?? [];

        if (!isDefined(props)) {
            throw new Error('Generic collapsible header was not rendered');
        }

        const controls = render(<>{props.persistentContent}</>);

        expect(GenericCollapsibleHeader).toHaveBeenCalledTimes(1);
        expect(props).toEqual(
            expect.objectContaining({
                scrollY: mockScrollY,
                expandedHeight: mockConfig.headerHeight,
                collapsedHeight: mockConfig.headerHeight,
                collapseStart: mockConfig.collapseStart,
                collapseDistance: mockConfig.collapseEnd - mockConfig.collapseStart,
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

    it('renders each public marker component', () => {
        expect.hasAssertions();

        const markers = render(
            <>
                <CollapsibleHeaderLeading>
                    <Text>Leading</Text>
                </CollapsibleHeaderLeading>
                <CollapsibleHeaderTitleSlot>
                    <CollapsibleHeaderLargeTitle>
                        <Text>Expanded</Text>
                    </CollapsibleHeaderLargeTitle>
                    <CollapsibleHeaderSmallTitle>
                        <Text>Collapsed</Text>
                    </CollapsibleHeaderSmallTitle>
                </CollapsibleHeaderTitleSlot>
                <CollapsibleHeaderTrailing>
                    <Text>Trailing</Text>
                </CollapsibleHeaderTrailing>
            </>
        );

        expect(markers.getByText('Leading')).toBeTruthy();
        expect(markers.getByText('Expanded')).toBeTruthy();
        expect(markers.getByText('Collapsed')).toBeTruthy();
        expect(markers.getByText('Trailing')).toBeTruthy();
    });
});
