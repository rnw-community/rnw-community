import { describe, expect, it, jest } from '@jest/globals';

import * as screenChrome from './index';

jest.mock('expo-blur', () => ({ BlurView: jest.fn(() => null) }));
jest.mock('expo-linear-gradient', () => ({ LinearGradient: jest.fn(() => null) }));
jest.mock('@react-native-masked-view/masked-view', () => ({ __esModule: true, default: jest.fn(() => null) }));

describe('public API', () => {
    it('exports the documented generic screen chrome surface', () => {
        expect.hasAssertions();

        expect(screenChrome).toEqual(
            expect.objectContaining({
                CollapsibleHeader: expect.any(Function),
                CollapsibleHeaderBackdrop: expect.any(Function),
                CollapsibleHeaderSlot: expect.any(Function),
                CollapsibleHeaderTitleSlot: expect.any(Function),
                EdgeFade: expect.any(Function),
                getEdgeFadeBandMetrics: expect.any(Function),
                ScreenChromeFrame: expect.any(Function),
                ScreenChromeProvider: expect.any(Function),
                ScreenChromeScrollView: expect.any(Function),
                SCREEN_CHROME_HEADER_LAYOUT_METRICS: { rowPadding: 16, slotSize: 44, titleInset: 72 },
                useScreenChrome: expect.any(Function),
                useScreenChromeScrollProps: expect.any(Function),
                useScrollFadeStyle: expect.any(Function),
            })
        );
        expect(screenChrome).not.toHaveProperty('CollapsibleHeaderLargeTitle');
        expect(screenChrome).not.toHaveProperty('CollapsibleHeaderLeading');
        expect(screenChrome).not.toHaveProperty('CollapsibleHeaderSmallTitle');
        expect(screenChrome).not.toHaveProperty('CollapsibleHeaderTrailing');
        expect(screenChrome).not.toHaveProperty('useScreenChromeScrollHandler');
    });
});
