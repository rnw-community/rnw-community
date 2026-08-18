import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { render } from '@testing-library/react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';

import { SCREEN_CHROME_DEFAULT_CONFIG } from '../constant/screen-chrome-default-config.constant';

import { EdgeFade } from './edge-fade';

import type { ScreenChromeColorScheme } from '../type/screen-chrome-color-scheme.type';
import type { ReactNode } from 'react';
import type { View } from 'react-native';

const mockScrollY = { get: jest.fn(() => 0) };
const mockConfig = SCREEN_CHROME_DEFAULT_CONFIG;
let mockColorScheme: ScreenChromeColorScheme = 'light';

jest.mock('@react-native-masked-view/masked-view', () => {
    const ReactModule = jest.requireActual<typeof import('react')>('react');

    return {
        __esModule: true,
        default: jest.fn(({ children, maskElement }: { readonly children?: ReactNode; readonly maskElement?: ReactNode }) =>
            ReactModule.createElement(ReactModule.Fragment, {}, maskElement, children)
        ),
    };
});
jest.mock('expo-blur', () => ({ BlurView: jest.fn(() => null) }));
jest.mock('expo-linear-gradient', () => ({ LinearGradient: jest.fn(() => null) }));
jest.mock('react-native-safe-area-context', () => ({
    useSafeAreaInsets: () => ({ top: 10, right: 20, bottom: 30, left: 40 }),
}));
jest.mock('../hooks/use-screen-chrome/use-screen-chrome.hook', () => ({
    useScreenChrome: () => ({
        colorScheme: mockColorScheme,
        config: mockConfig,
    }),
}));
jest.mock('@rnw-community/react-native-collapsible-header', () => ({
    useCollapsibleHeaderScroll: () => ({ scrollY: mockScrollY }),
}));

beforeEach(() => {
    jest.mocked(BlurView).mockClear();
    jest.mocked(LinearGradient).mockClear();
    mockColorScheme = 'light';
    mockScrollY.get.mockReturnValue(0);
});

describe('EdgeFade native', () => {
    it('renders an inert top safe-area band', () => {
        expect.hasAssertions();

        const screen = render(<EdgeFade testID="top-fade" position="top" intensity={0} blurMethod="none" />);
        const fade = screen.getByTestId('top-fade', { includeHiddenElements: true });

        expect(fade).toHaveProp('pointerEvents', 'none');
        expect(fade).toHaveProp('accessible', false);
        expect(fade).toHaveProp('accessibilityElementsHidden', true);
        expect(fade).toHaveProp('importantForAccessibility', 'no-hide-descendants');
        expect(fade).toHaveStyle({ height: 160, top: -10 });
    });

    it('renders the top mask, wash, and explicit zero blur intensity', () => {
        expect.hasAssertions();

        render(<EdgeFade position="top" intensity={0} blurMethod="none" />);
        const [[maskGradientProps], [washGradientProps]] = jest.mocked(LinearGradient).mock.calls;
        const [[blurProps]] = jest.mocked(BlurView).mock.calls;

        expect(maskGradientProps.colors).toHaveLength(maskGradientProps.locations?.length ?? 0);
        expect(maskGradientProps.locations?.at(0)).toBe(0);
        expect(maskGradientProps.locations?.at(-1)).toBe(1);
        expect(washGradientProps).toEqual(
            expect.objectContaining({ colors: ['rgba(255,255,255,0.42)', 'rgba(255,255,255,0.08)'] })
        );
        expect(blurProps).toEqual(
            expect.objectContaining({ intensity: 0, tint: 'systemChromeMaterialLight', blurMethod: 'none' })
        );
    });

    it('drives bottom opacity and blur intensity from scroll animation ranges', () => {
        expect.hasAssertions();

        mockColorScheme = 'dark';
        mockScrollY.get.mockReturnValue(40);

        const screen = render(
            <EdgeFade
                testID="bottom-fade"
                position="bottom"
                scrollAnimation={{ opacityInputRange: [0, 80], intensityInputRange: [0, 80], maxIntensity: 60 }}
            />
        );
        const fade = screen.getByTestId('bottom-fade', { includeHiddenElements: true });
        const [, [washGradientProps]] = jest.mocked(LinearGradient).mock.calls;
        const [[blurProps]] = jest.mocked(BlurView).mock.calls;

        expect(fade).toHaveStyle({ height: 180, bottom: -30, opacity: 0.5 });
        expect(washGradientProps).toEqual(expect.objectContaining({ colors: ['rgba(0,0,0,0.12)', 'rgba(0,0,0,0.48)'] }));
        expect(blurProps).toEqual(
            expect.objectContaining({ intensity: 30, tint: 'systemThinMaterialDark', blurMethod: 'none' })
        );
    });

    it('opts into the Android blur method only once a blur target is supplied', () => {
        expect.hasAssertions();

        const blurTarget = React.createRef<View>();

        render(<EdgeFade position="top" blurTarget={blurTarget} />);

        const [[blurProps]] = jest.mocked(BlurView).mock.calls;

        expect(blurProps).toEqual(expect.objectContaining({ blurMethod: 'dimezisBlurView', blurTarget }));
    });

    it('keeps an explicit blur method when no blur target is supplied', () => {
        expect.hasAssertions();

        render(<EdgeFade position="top" blurMethod="dimezisBlurViewSdk31Plus" />);

        const [[blurProps]] = jest.mocked(BlurView).mock.calls;

        expect(blurProps).toEqual(expect.objectContaining({ blurMethod: 'dimezisBlurViewSdk31Plus' }));
        expect(blurProps.blurTarget).toBeUndefined();
    });
});
