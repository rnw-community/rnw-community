import { describe, expect, it, jest } from '@jest/globals';
import { render } from '@testing-library/react-native';
import React from 'react';
import { Text } from 'react-native';

import { CollapsibleHeaderProvider } from '@rnw-community/react-native-collapsible-header';

import { CollapsibleHeaderSlot } from '../collapsible-header-slot/collapsible-header-slot';
import { CollapsibleHeaderTitleSlot } from '../collapsible-header-title-slot/collapsible-header-title-slot';
import { SCREEN_CHROME_DEFAULT_CONFIG } from '../constant/screen-chrome-default-config.constant';

import { CollapsibleHeader } from './collapsible-header';

const mockConfig = { ...SCREEN_CHROME_DEFAULT_CONFIG, snapToCollapse: true };

jest.mock('react-native-safe-area-context', () => ({
    useSafeAreaInsets: () => ({ top: 12, right: 0, bottom: 0, left: 0 }),
}));
jest.mock('../hook/use-screen-chrome.hook', () => ({
    useScreenChrome: () => ({ config: mockConfig }),
}));

describe('CollapsibleHeader integration', () => {
    it('mounts title and control slots once through the provider-driven generic header', () => {
        expect.hasAssertions();

        const screen = render(
            <CollapsibleHeaderProvider>
                <CollapsibleHeader>
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
});
