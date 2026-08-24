import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { render } from '@testing-library/react-native';
import React from 'react';
import { View } from 'react-native';

import { SCREEN_CHROME_DEFAULT_CONFIG } from '../constant/screen-chrome-default-config.constant';

import { EdgeFade } from './edge-fade';

import type { ScreenChromeColorScheme } from '../type/screen-chrome-color-scheme.type';
import type { ReactNode } from 'react';

const mockScrollY = { get: jest.fn(() => 0) };
const mockConfig = SCREEN_CHROME_DEFAULT_CONFIG;
let mockColorScheme: ScreenChromeColorScheme = 'light';

const MockBlurHost = (props: { readonly testID?: string } | undefined): ReactNode => <View {...props} />;

jest.mock('expo-blur', () => ({ BlurView: (props: { readonly testID?: string } | undefined) => MockBlurHost(props) }));
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

    it('renders the top blur band with explicit zero intensity', () => {
        expect.hasAssertions();

        const screen = render(<EdgeFade testID="top-fade" position="top" intensity={0} blurMethod="none" />);
        const fade = screen.getByTestId('top-fade', { includeHiddenElements: true });

        expect(fade).toHaveProp('intensity', 0);
        expect(fade).toHaveProp('tint', 'systemChromeMaterialLight');
        expect(fade).toHaveProp('blurMethod', 'none');
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

        expect(fade).toHaveStyle({ height: 180, bottom: -30, opacity: 0.5 });
        expect(fade).toHaveProp('intensity', 30);
        expect(fade).toHaveProp('tint', 'systemThinMaterialDark');
        expect(fade).toHaveProp('blurMethod', 'none');
    });

    it('opts into the Android blur method only once a blur target is supplied', () => {
        expect.hasAssertions();

        const blurTarget = React.createRef<View>();
        const targeted = render(<EdgeFade testID="targeted-fade" position="top" blurTarget={blurTarget} />);

        expect(targeted.getByTestId('targeted-fade', { includeHiddenElements: true })).toHaveProp(
            'blurMethod',
            'dimezisBlurView'
        );

        const untargeted = render(<EdgeFade testID="untargeted-fade" position="top" />);

        expect(untargeted.getByTestId('untargeted-fade', { includeHiddenElements: true })).toHaveProp('blurMethod', 'none');
    });
});
