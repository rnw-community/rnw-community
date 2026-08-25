import { describe, expect, it, jest } from '@jest/globals';
import { render } from '@testing-library/react-native';
import React from 'react';

import { SCREEN_CHROME_DEFAULT_CONFIG } from '../constant/screen-chrome-default-config.constant';
import { EdgeFade } from '../edge-fade/edge-fade';

import { CollapsibleHeaderBackdrop } from './collapsible-header-backdrop';

const mockConfig = SCREEN_CHROME_DEFAULT_CONFIG;

jest.mock('../edge-fade/edge-fade', () => ({ EdgeFade: jest.fn(() => null) }));
jest.mock('../hooks/use-screen-chrome/use-screen-chrome.hook', () => ({
    useScreenChrome: () => ({ config: mockConfig }),
}));

describe('CollapsibleHeaderBackdrop', () => {
    it('maps header collapse thresholds to a top edge fade', () => {
        expect.hasAssertions();

        render(<CollapsibleHeaderBackdrop />);

        expect(jest.mocked(EdgeFade).mock.calls[0][0]).toEqual({
            position: 'top',
            height: mockConfig.headerBackdropHeight,
            scrollAnimation: {
                opacityInputRange: [mockConfig.collapseStart, mockConfig.smallTitleStart],
                intensityInputRange: [mockConfig.collapseStart, mockConfig.collapseEnd],
            },
        });
    });
});
