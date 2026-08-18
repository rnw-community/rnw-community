import { describe, expect, it, jest } from '@jest/globals';

import * as screenChrome from './index';

jest.mock('@react-native-masked-view/masked-view', () => ({ __esModule: true, default: jest.fn(() => null) }));
jest.mock('expo-blur', () => ({ BlurView: jest.fn(() => null) }));
jest.mock('expo-linear-gradient', () => ({ LinearGradient: jest.fn(() => null) }));

describe('public API', () => {
    it('exports the documented generic screen chrome surface', () => {
        expect(screenChrome).toEqual(
            expect.objectContaining({
                CollapsibleHeader: expect.any(Function),
                CollapsibleHeaderBackdrop: expect.any(Function),
                CollapsibleHeaderSlot: expect.any(Function),
                CollapsibleHeaderTitleSlot: expect.any(Function),
                EdgeFade: expect.any(Function),
                ScreenChromeFrame: expect.any(Function),
                ScreenChromeProvider: expect.any(Function),
                ScreenChromeScrollView: expect.any(Function),
                useScreenChrome: expect.any(Function),
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
