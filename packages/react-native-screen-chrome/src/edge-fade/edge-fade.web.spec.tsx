import { describe, expect, it, jest } from '@jest/globals';
import { render } from '@testing-library/react-native';
import React from 'react';

import { SCREEN_CHROME_DEFAULT_CONFIG } from '../constant/screen-chrome-default-config.constant.web';

import { EdgeFade } from './edge-fade.web';

const mockScrollY = { get: jest.fn(() => 0) };
const mockContext = {
    colorScheme: 'light' as const,
    config: SCREEN_CHROME_DEFAULT_CONFIG,
};

jest.mock('react-native-safe-area-context', () => ({
    useSafeAreaInsets: () => ({ top: 10, right: 20, bottom: 30, left: 40 }),
}));
jest.mock('../hooks/use-screen-chrome/use-screen-chrome.hook', () => ({ useScreenChrome: () => mockContext }));
jest.mock('@rnw-community/react-native-collapsible-header', () => ({
    useCollapsibleHeaderScroll: () => ({ scrollY: mockScrollY }),
}));

describe('EdgeFade web', () => {
    it('renders the web defaults with ordered CSS masks and a static top blur', () => {
        const screen = render(<EdgeFade testID="top-fade" position="top" />);
        const fade = screen.getByTestId('top-fade', { includeHiddenElements: true });

        expect(fade).toHaveProp('pointerEvents', 'none');
        expect(fade).toHaveProp('aria-hidden', true);
        expect(fade).toHaveStyle({ height: 86, top: -10 });
        expect(fade).toHaveProp(
            'style',
            expect.arrayContaining([
                expect.objectContaining({
                    backdropFilter: 'blur(22.5px) saturate(1.08)',
                    WebkitBackdropFilter: 'blur(22.5px) saturate(1.08)',
                    maskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.99) 0%, #000000 50%, transparent 100%)',
                    WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.99) 0%, #000000 50%, transparent 100%)',
                    backgroundImage:
                        'linear-gradient(to bottom, rgba(255,255,255,0.42) 0%, rgba(255,255,255,0.08) 72%, transparent 100%)',
                }),
            ])
        );
    });

    it('animates only bottom opacity while preserving explicit zero blur and consumer styles', () => {
        mockScrollY.get.mockReturnValue(10);

        const screen = render(
            <EdgeFade
                testID="bottom-fade"
                position="bottom"
                height={50}
                intensity={0}
                scrollAnimation={{ opacityInputRange: [0, 20], intensityInputRange: [0, 20] }}
                style={{ zIndex: 9 }}
            />
        );
        const fade = screen.getByTestId('bottom-fade', { includeHiddenElements: true });

        expect(fade).toHaveStyle({ height: 80, bottom: -30, opacity: 0.5, zIndex: 9 });
        expect(fade).toHaveProp(
            'style',
            expect.arrayContaining([
                expect.objectContaining({
                    backdropFilter: 'blur(8px) saturate(1.08)',
                    backgroundImage:
                        'linear-gradient(to bottom, transparent 0%, rgba(255,255,255,0.08) 28%, rgba(255,255,255,0.42) 100%)',
                }),
            ])
        );
    });
});
