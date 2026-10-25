import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { render } from '@testing-library/react-native';
import React from 'react';

import { SCREEN_CHROME_DEFAULT_CONFIG } from '../constant/screen-chrome-default-config.constant';
import { EdgeFade } from '../edge-fade/edge-fade';

import { CollapsibleHeaderBackdrop } from './collapsible-header-backdrop';

let mockConfig = SCREEN_CHROME_DEFAULT_CONFIG;

jest.mock('../edge-fade/edge-fade', () => ({ EdgeFade: jest.fn(() => null) }));
jest.mock('../hooks/use-screen-chrome/use-screen-chrome.hook', () => ({
    useScreenChrome: () => ({ config: mockConfig }),
}));

beforeEach(() => {
    mockConfig = SCREEN_CHROME_DEFAULT_CONFIG;
    jest.mocked(EdgeFade).mockClear();
});

describe('CollapsibleHeaderBackdrop', () => {
    it('maps header collapse thresholds to a top edge fade', () => {
        expect.hasAssertions();

        render(<CollapsibleHeaderBackdrop />);

        expect(jest.mocked(EdgeFade).mock.calls[0][0]).toEqual({
            position: 'top',
            height: mockConfig.headerBackdropHeight,
            intensity: mockConfig.maxBlurIntensity,
            scrollAnimation: void 0,
        });
    });

    it('uses maximum blur intensity by default when the band stays persistent', () => {
        expect.hasAssertions();

        mockConfig = { ...SCREEN_CHROME_DEFAULT_CONFIG, intensity: 30, maxBlurIntensity: 45 };

        render(<CollapsibleHeaderBackdrop />);

        expect(jest.mocked(EdgeFade).mock.calls[0][0]).toEqual({
            position: 'top',
            height: mockConfig.headerBackdropHeight,
            intensity: 45,
            scrollAnimation: void 0,
        });
    });

    it('forwards edge-fade props and lets explicit geometry and animation override the header defaults', () => {
        expect.hasAssertions();

        const renderBand = jest.fn(() => null);
        const scrollAnimation = { opacityInputRange: [0, 10] as const };
        const unsafeProps = { position: 'bottom' } as object;

        render(
            <CollapsibleHeaderBackdrop
                {...unsafeProps}
                testID="backdrop"
                style={{ zIndex: 5 }}
                height={64}
                chromeHeight={40}
                intensity={12}
                scrollAnimation={scrollAnimation}
                renderBand={renderBand}
            />
        );

        expect(jest.mocked(EdgeFade).mock.calls[0][0]).toEqual({
            testID: 'backdrop',
            style: { zIndex: 5 },
            position: 'top',
            height: 64,
            chromeHeight: 40,
            intensity: 12,
            scrollAnimation,
            renderBand,
        });
    });
});
