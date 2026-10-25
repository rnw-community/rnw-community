import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { render } from '@testing-library/react-native';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { isDefined } from '@rnw-community/shared';

import { EDGE_FADE_FULL_BLUR_FRACTION } from '../constant/edge-fade-full-blur-fraction.constant';
import { SCREEN_CHROME_DEFAULT_CONFIG } from '../constant/screen-chrome-default-config.constant';

import { EdgeFade } from './edge-fade';

import type { EdgeFadeBandRenderer } from './edge-fade-band-renderer.type';
import type { EdgeFadePosition } from './edge-fade-position.type';
import type { ScreenChromeColorScheme } from '../type/screen-chrome-color-scheme.type';
import type { RenderResult } from '@testing-library/react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import type { ReactTestInstance } from 'react-test-renderer';

const TOP_INSET = 10;
const DEFAULT_BLUR_RADIUS = 22.5;
const TALL_CHROME_HEIGHT = 84;
const QUARTER_FRACTION = 0.25;
const HALF_FRACTION = 0.5;
const THREE_QUARTER_FRACTION = 0.75;
const MASK_STOP_FRACTIONS = [0, QUARTER_FRACTION, HALF_FRACTION, THREE_QUARTER_FRACTION, 1] as const;
const NATIVE_TOP_MASK_LOCATIONS = MASK_STOP_FRACTIONS.map(
    fraction => EDGE_FADE_FULL_BLUR_FRACTION + (1 - EDGE_FADE_FULL_BLUR_FRACTION) * fraction
);
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

    it.each<[EdgeFadePosition, number | undefined]>([
        ['top', void 0],
        ['bottom', void 0],
        ['top', TALL_CHROME_HEIGHT],
        ['bottom', TALL_CHROME_HEIGHT],
    ])(
        'holds the %s native blur over the outer full-blur fraction whatever the chrome height (%s)',
        (position, chromeHeight) => {
            expect.hasAssertions();

            mockColorScheme = 'dark';

            expect(
                getBlurProps(render(<EdgeFade position={position} intensity={40} chromeHeight={chromeHeight} />))
            ).toStrictEqual({
                style: { flex: 1 },
                position,
                radius: 18,
                plateau: EDGE_FADE_FULL_BLUR_FRACTION,
            });
        }
    );

    it.each([0, 20, 40, 80])('keeps a default band visible at scroll offset %s', scrollOffset => {
        expect.hasAssertions();

        mockScrollY.get.mockReturnValue(scrollOffset);

        const screen = render(<EdgeFade testID="persistent-fade" position="top" />);

        expect(screen.getByTestId('persistent-fade', hidden)).not.toHaveStyle({ opacity: 0 });
        expect(getBlurProps(screen).radius).toBe(DEFAULT_BLUR_RADIUS);
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
            'linear-gradient(to bottom, rgba(255,255,255,0.42) 0%, rgba(255,255,255,0.392) 8%, rgba(255,255,255,0.176) 31%, rgba(255,255,255,0.059) 54%, rgba(255,255,255,0.009) 77%, rgba(255,255,255,0) 100%)'
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
                maskLocations: NATIVE_TOP_MASK_LOCATIONS,
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
