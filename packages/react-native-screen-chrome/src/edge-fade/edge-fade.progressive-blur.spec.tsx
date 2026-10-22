import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { render } from '@testing-library/react-native';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { SCREEN_CHROME_DEFAULT_CONFIG } from '../constant/screen-chrome-default-config.constant';

import { EdgeFade } from './edge-fade';

import type { EdgeFadePosition } from './edge-fade-position.type';
import type { ScreenChromeColorScheme } from '../type/screen-chrome-color-scheme.type';
import type { RenderResult } from '@testing-library/react-native';
import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import type { ReactTestInstance } from 'react-test-renderer';

interface MockHostProps {
    readonly children?: ReactNode;
    readonly maskElement?: ReactNode;
}

interface ProgressiveHostProps {
    readonly blurType?: string;
    readonly blurAmount?: number;
    readonly direction?: string;
    readonly startOffset?: number;
    readonly style?: StyleProp<ViewStyle>;
}

const mockScrollY = { get: jest.fn(() => 0) };
let mockColorScheme: ScreenChromeColorScheme = 'light';
const mockConfig = SCREEN_CHROME_DEFAULT_CONFIG;
const TOP_INSET = 10;
const BOTTOM_INSET = 30;
const BAND = 120;
const TAB_BAR = 84;

const MockProgressiveHost = (props: MockHostProps): ReactNode => <View testID="progressive-host" {...props} />;
const MockExpoBlurHost = (props: MockHostProps): ReactNode => <View testID="expo-blur-host" {...props} />;
const MockMaskedHost = ({ children }: MockHostProps): ReactNode => <View testID="mask-host">{children}</View>;

jest.mock('@sbaiahmed1/react-native-blur', () => ({
    ProgressiveBlurView: (props: MockHostProps) => MockProgressiveHost(props),
}));
jest.mock('expo-blur', () => ({ BlurView: (props: MockHostProps) => MockExpoBlurHost(props) }));
jest.mock('expo-linear-gradient', () => ({ LinearGradient: () => null }));
jest.mock('@react-native-masked-view/masked-view', () => ({
    __esModule: true,
    default: (props: MockHostProps) => MockMaskedHost(props),
}));
jest.mock('react-native-safe-area-context', () => ({
    useSafeAreaInsets: () => ({ top: 10, right: 0, bottom: 30, left: 0 }),
}));
jest.mock('../hooks/use-screen-chrome/use-screen-chrome.hook', () => ({
    useScreenChrome: () => ({
        colorScheme: mockColorScheme,
        config: mockConfig,
        renderEdgeFadeBand: void 0,
    }),
}));
jest.mock('@rnw-community/react-native-collapsible-header', () => ({
    useCollapsibleHeaderScroll: () => ({ scrollY: mockScrollY }),
}));

const hidden = { includeHiddenElements: true };

const getProgressiveHost = (screen: RenderResult): ReactTestInstance => screen.getByTestId('progressive-host', hidden);

const hostProps = (instance: ReactTestInstance): ProgressiveHostProps => instance.props;

const getProgressiveProps = (screen: RenderResult): ProgressiveHostProps => hostProps(getProgressiveHost(screen));

beforeEach(() => {
    mockColorScheme = 'light';
    mockScrollY.get.mockReturnValue(0);
});

describe('EdgeFade native progressive blur', () => {
    it.each<[EdgeFadePosition, string, number]>([
        ['top', 'blurredTopClearBottom', TOP_INSET / (SCREEN_CHROME_DEFAULT_CONFIG.topFadeHeight + TOP_INSET)],
        ['bottom', 'blurredBottomClearTop', BOTTOM_INSET / (SCREEN_CHROME_DEFAULT_CONFIG.bottomFadeHeight + BOTTOM_INSET)],
    ])(
        'renders one %s progressive blur holding over the safe-area inset instead of the stepped slices',
        (position, direction, plateau) => {
            expect.hasAssertions();

            const screen = render(<EdgeFade position={position} intensity={40} />);

            expect(screen.queryAllByTestId('expo-blur-host', hidden)).toHaveLength(0);
            expect(getProgressiveProps(screen)).toMatchObject({
                blurType: 'light',
                blurAmount: 18,
                direction,
                startOffset: plateau,
            });
            expect(StyleSheet.flatten(getProgressiveProps(screen).style)).toMatchObject({
                position: 'absolute',
                top: 0,
                right: 0,
                bottom: 0,
                left: 0,
            });
            expect(
                screen.getByTestId('mask-host', hidden).findAll(node => node === getProgressiveHost(screen))
            ).toHaveLength(0);
        }
    );

    it('holds the full blur behind the chrome height before ramping to the inner edge', () => {
        expect.hasAssertions();

        const screen = render(<EdgeFade position="bottom" height={BAND} chromeHeight={TAB_BAR} />);

        expect(getProgressiveProps(screen)).toHaveProperty('startOffset', (BOTTOM_INSET + TAB_BAR) / (BAND + BOTTOM_INSET));
    });

    it('follows the provider color scheme', () => {
        expect.hasAssertions();

        mockColorScheme = 'dark';

        expect(getProgressiveProps(render(<EdgeFade position="top" />))).toHaveProperty('blurType', 'dark');
    });

    it('drives the scroll-animated blur through opacity at the maximum intensity radius', () => {
        expect.hasAssertions();

        mockScrollY.get.mockReturnValue(40);

        const screen = render(
            <EdgeFade position="top" scrollAnimation={{ intensityInputRange: [0, 80], maxIntensity: 60 }} />
        );

        expect(getProgressiveProps(screen)).toHaveProperty('blurAmount', 27);
        expect(
            screen.UNSAFE_root.findAll(
                node => typeof node.type === 'string' && StyleSheet.flatten(hostProps(node).style)?.opacity === 0.5
            )
        ).toHaveLength(1);
    });
});
