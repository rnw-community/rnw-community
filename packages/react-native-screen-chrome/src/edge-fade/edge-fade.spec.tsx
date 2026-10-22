import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { render } from '@testing-library/react-native';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { isDefined } from '@rnw-community/shared';

import { SCREEN_CHROME_DEFAULT_CONFIG } from '../constant/screen-chrome-default-config.constant';

import { EdgeFade } from './edge-fade';

import type { EdgeFadeBandRenderer } from './edge-fade-band-renderer.type';
import type { EdgeFadePosition } from './edge-fade-position.type';
import type { ScreenChromeColorScheme } from '../type/screen-chrome-color-scheme.type';
import type { RenderResult } from '@testing-library/react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import type { ReactTestInstance } from 'react-test-renderer';

const TOP_INSET = 10;
const BOTTOM_INSET = 30;
const QUARTER_STOP = 0.25;
const TOP_MASK_COLORS = ['#000000', 'rgba(0,0,0,0.56)', 'rgba(0,0,0,0.25)', 'rgba(0,0,0,0.06)', 'transparent'];
const mockScrollY = { get: jest.fn(() => 0) };
const mockConfig = SCREEN_CHROME_DEFAULT_CONFIG;
const hidden = { includeHiddenElements: true };
let mockColorScheme: ScreenChromeColorScheme = 'light';
let mockRenderEdgeFadeBand: EdgeFadeBandRenderer | undefined = void 0;
let mockExternalScrollY: { readonly get: () => number } | undefined = void 0;

jest.mock('react-native-safe-area-context', () => ({
    useSafeAreaInsets: () => ({ top: 10, right: 20, bottom: 30, left: 40 }),
}));
jest.mock('../hooks/use-screen-chrome/use-screen-chrome.hook', () => ({
    useScreenChrome: () => ({
        colorScheme: mockColorScheme,
        config: mockConfig,
        renderEdgeFadeBand: mockRenderEdgeFadeBand,
        externalScrollY: mockExternalScrollY,
    }),
}));
jest.mock('@rnw-community/react-native-collapsible-header', () => ({
    useCollapsibleHeaderScroll: () => ({ scrollY: mockScrollY }),
}));

interface BlurProps {
    readonly position: string;
    readonly radius: number;
    readonly plateau: number;
}

const getBlur = (screen: RenderResult) => screen.UNSAFE_getByType('ScreenChromeProgressiveBlurView' as never);
const getBlurProps = (screen: RenderResult): BlurProps => getBlur(screen).props as BlurProps;
const getStyle = (node: ReactTestInstance | null | undefined): ViewStyle =>
    StyleSheet.flatten((node?.props as { readonly style?: StyleProp<ViewStyle> } | undefined)?.style) ?? {};

beforeEach(() => {
    mockColorScheme = 'light';
    mockRenderEdgeFadeBand = void 0;
    mockExternalScrollY = void 0;
    mockScrollY.get.mockReturnValue(0);
});

describe('EdgeFade native', () => {
    it('renders an inert band anchored to the screen edge', () => {
        expect.hasAssertions();

        const screen = render(<EdgeFade testID="top-fade" position="top" />);
        const fade = screen.getByTestId('top-fade', hidden);

        expect(fade).toHaveProp('pointerEvents', 'none');
        expect(fade).toHaveProp('accessible', false);
        expect(fade).toHaveProp('accessibilityElementsHidden', true);
        expect(fade).toHaveProp('importantForAccessibility', 'no-hide-descendants');
        expect(fade).toHaveStyle({ height: mockConfig.topFadeHeight + TOP_INSET, top: 0 });
    });

    it.each<[EdgeFadePosition, number, number]>([
        ['top', mockConfig.topFadeHeight + TOP_INSET, TOP_INSET],
        ['bottom', mockConfig.bottomFadeHeight + BOTTOM_INSET, BOTTOM_INSET],
    ])('holds the %s native blur over the safe-area inset by default', (position, band, inset) => {
        expect.hasAssertions();

        mockColorScheme = 'dark';

        expect(getBlurProps(render(<EdgeFade position={position} intensity={40} />))).toStrictEqual({
            style: { flex: 1 },
            position,
            radius: 18,
            plateau: inset / band,
        });
    });

    it('holds the full blur behind the chrome height before ramping to the inner edge', () => {
        expect.hasAssertions();

        const band = 120;
        const chrome = 84;

        expect(getBlurProps(render(<EdgeFade position="bottom" height={band} chromeHeight={chrome} />)).plateau).toBe(
            (BOTTOM_INSET + chrome) / (band + BOTTOM_INSET)
        );
    });

    it('fades the band and its blur by scroll while the blur radius stays at the maximum intensity', () => {
        expect.hasAssertions();

        mockScrollY.get.mockReturnValue(40);

        const screen = render(
            <EdgeFade
                testID="bottom-fade"
                position="bottom"
                scrollAnimation={{ opacityInputRange: [0, 80], intensityInputRange: [0, 80], maxIntensity: 60 }}
            />
        );

        expect(screen.getByTestId('bottom-fade', hidden)).toHaveStyle({ opacity: 0.5 });
        expect(getBlurProps(screen).radius).toBe(27);
        expect(getStyle(getBlur(screen).parent).opacity).toBe(0.5);
    });

    it('reads the scroll offset from the provider external scroll value when one is set', () => {
        expect.hasAssertions();

        mockExternalScrollY = { get: () => 20 };

        const screen = render(
            <EdgeFade testID="top-fade" position="top" scrollAnimation={{ opacityInputRange: [0, 80] }} />
        );

        expect(screen.getByTestId('top-fade', hidden)).toHaveStyle({ opacity: 0.25 });
    });

    it('paints the wash as one gradient eased out by the configured mask stops', () => {
        expect.hasAssertions();

        const screen = render(<EdgeFade testID="top-fade" position="top" />);
        const wash = screen
            .getByTestId('top-fade', hidden)
            .findAll(node => typeof node.type === 'string' && isDefined(getStyle(node).experimental_backgroundImage));

        expect(getStyle(wash[0]).experimental_backgroundImage).toBe(
            'linear-gradient(to bottom, rgba(255,255,255,0.42) 0%, rgba(255,255,255,0.187) 25%, rgba(255,255,255,0.062) 50%, rgba(255,255,255,0.01) 75%, rgba(255,255,255,0) 100%)'
        );
    });
});

describe('EdgeFade native band renderer', () => {
    it('hands the resolved band visuals to a per-instance renderer inside the inert animated container', () => {
        expect.hasAssertions();

        const renderBand = jest.fn<EdgeFadeBandRenderer>(({ blur }) => <View testID="custom-band">{blur}</View>);
        const screen = render(<EdgeFade position="top" renderBand={renderBand} />);

        expect(renderBand).toHaveBeenCalledWith(
            expect.objectContaining({
                position: 'top',
                colorScheme: 'light',
                height: mockConfig.topFadeHeight + TOP_INSET,
                washColors: [mockConfig.colors.light.solid, mockConfig.colors.light.wash],
                maskColors: TOP_MASK_COLORS,
                maskLocations: [0, QUARTER_STOP, 0.5, 0.75, 1],
            })
        );
        expect(screen.getByTestId('custom-band', hidden)).toBeTruthy();
        expect(getBlur(screen)).toBeTruthy();
    });

    it('lets a renderer wrap the default band and renders nothing when it returns null', () => {
        expect.hasAssertions();

        const wrapped = render(
            <EdgeFade position="bottom" renderBand={({ defaultBand }) => <View testID="wrapper">{defaultBand}</View>} />
        );

        expect(wrapped.getByTestId('wrapper', hidden)).toBeTruthy();
        expect(getBlur(wrapped)).toBeTruthy();
        expect(
            render(<EdgeFade testID="empty" position="top" renderBand={() => null} />).getByTestId('empty', hidden).children
        ).toHaveLength(0);
    });

    it('inherits the provider renderer and prefers the per-instance renderer over it', () => {
        expect.hasAssertions();

        mockRenderEdgeFadeBand = () => <View testID="provider-band" />;

        expect(render(<EdgeFade position="top" />).getByTestId('provider-band', hidden)).toBeTruthy();

        const overridden = render(<EdgeFade position="top" renderBand={() => <View testID="instance-band" />} />);

        expect(overridden.getByTestId('instance-band', hidden)).toBeTruthy();
        expect(overridden.queryByTestId('provider-band', hidden)).toBeNull();
    });
});
