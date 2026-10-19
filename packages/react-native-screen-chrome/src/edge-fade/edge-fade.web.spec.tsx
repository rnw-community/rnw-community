import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { render } from '@testing-library/react-native';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { SCREEN_CHROME_DEFAULT_CONFIG } from '../constant/screen-chrome-default-config.constant.web';

import { EdgeFade } from './edge-fade.web';

import type { EdgeFadeBandRenderer } from './edge-fade-band-renderer.type';
import type { WebEdgeFadeStyleInterface } from './web-edge-fade-style.interface';
import type { StyleProp } from 'react-native';
import type { SharedValue } from 'react-native-reanimated';

const mockScrollY = { get: jest.fn(() => 0) };
const mockContext: {
    colorScheme: 'light';
    config: typeof SCREEN_CHROME_DEFAULT_CONFIG;
    renderEdgeFadeBand?: EdgeFadeBandRenderer;
    externalScrollY?: SharedValue<number>;
} = {
    colorScheme: 'light',
    config: SCREEN_CHROME_DEFAULT_CONFIG,
};

jest.mock('react-native-safe-area-context', () => ({
    useSafeAreaInsets: () => ({ top: 10, right: 20, bottom: 30, left: 40 }),
}));
jest.mock('../hooks/use-screen-chrome/use-screen-chrome.hook', () => ({ useScreenChrome: () => mockContext }));
jest.mock('@rnw-community/react-native-collapsible-header', () => ({
    useCollapsibleHeaderScroll: () => ({ scrollY: mockScrollY }),
}));

beforeEach(() => {
    mockContext.renderEdgeFadeBand = void 0;
    mockScrollY.get.mockReturnValue(0);
});

const TOP_EDGE_MASK = 'linear-gradient(to bottom, rgba(0,0,0,0.99) 0%, #000000 50%, transparent 100%)';
const TOP_WASH = 'linear-gradient(to bottom, rgba(255,255,255,0.42) 0%, rgba(255,255,255,0.08) 72%, transparent 100%)';

type HostInstance = ReturnType<ReturnType<typeof render>['getByTestId']>;

const flattenStyle = ({ props: { style } }: HostInstance): WebEdgeFadeStyleInterface =>
    StyleSheet.flatten(style as StyleProp<WebEdgeFadeStyleInterface>);

const getLayerStyles = (root: HostInstance): WebEdgeFadeStyleInterface[] =>
    root.findAll(node => typeof node.type === 'string' && node !== root).map(flattenStyle);

describe('EdgeFade web', () => {
    it('renders the web defaults as progressive blur layers under a masked wash', () => {
        expect.hasAssertions();

        const screen = render(<EdgeFade testID="top-fade" position="top" blurMethod="dimezisBlurView" />);
        const fade = screen.getByTestId('top-fade', { includeHiddenElements: true });

        expect(fade.props).not.toHaveProperty('blurMethod');
        expect(fade.props).not.toHaveProperty('blurTarget');
        expect(fade).toHaveProp('pointerEvents', 'none');
        expect(fade).toHaveProp('aria-hidden', true);
        expect(flattenStyle(fade)).toEqual({
            position: 'absolute',
            left: 0,
            right: 0,
            zIndex: 2,
            height: 86,
            top: -10,
        });
        expect(getLayerStyles(fade).map(({ backdropFilter }) => backdropFilter)).toEqual([
            'blur(2.8125px) saturate(1.08)',
            'blur(5.625px) saturate(1.08)',
            'blur(11.25px) saturate(1.08)',
            'blur(22.5px) saturate(1.08)',
            void 0,
        ]);
        expect(getLayerStyles(fade)[4]).toEqual({
            position: 'absolute',
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
            maskImage: TOP_EDGE_MASK,
            WebkitMaskImage: TOP_EDGE_MASK,
            backgroundImage: TOP_WASH,
        });
    });

    it('fades every band layer by scroll instead of the container, keeping explicit zero blur and consumer styles', () => {
        expect.hasAssertions();

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
        const layers = getLayerStyles(fade);

        expect(fade).toHaveStyle({ height: 80, bottom: -30, zIndex: 9 });
        expect(flattenStyle(fade)).not.toHaveProperty('opacity');
        expect(layers.map(({ opacity }) => opacity)).toEqual([0.5, 0.5, 0.5, 0.5, 0.5]);
        expect(layers[3]).toHaveProperty('backdropFilter', 'blur(8px) saturate(1.08)');
        expect(layers[4]).toMatchObject({
            backgroundImage:
                'linear-gradient(to bottom, transparent 0%, rgba(255,255,255,0.08) 28%, rgba(255,255,255,0.42) 100%)',
        });
    });
});

describe('EdgeFade web band renderer', () => {
    it('keeps positioning, opacity and inertness on the container while handing the visuals to the renderer', () => {
        expect.hasAssertions();

        mockScrollY.get.mockReturnValue(10);

        const renderBand = jest.fn<EdgeFadeBandRenderer>(({ blur, defaultBand }) => (
            <View testID="custom-band">
                {blur}
                {defaultBand}
            </View>
        ));
        const screen = render(
            <EdgeFade
                testID="top-fade"
                position="top"
                renderBand={renderBand}
                scrollAnimation={{ opacityInputRange: [0, 20] }}
            />
        );
        const fade = screen.getByTestId('top-fade', { includeHiddenElements: true });

        expect(renderBand).toHaveBeenCalledWith(
            expect.objectContaining({
                position: 'top',
                colorScheme: 'light',
                height: 86,
                tint: 'systemMaterialLight',
                washColors: [
                    SCREEN_CHROME_DEFAULT_CONFIG.colors.light.solid,
                    SCREEN_CHROME_DEFAULT_CONFIG.colors.light.wash,
                ],
                maskColors: ['rgba(0,0,0,0.99)', '#000000', 'transparent'],
                maskLocations: [0, 0.5, 1],
            })
        );
        expect(fade).toHaveProp('aria-hidden', true);
        expect(fade).toHaveStyle({ height: 86, top: -10, opacity: 0.5 });
        expect(fade).not.toHaveProp(
            'style',
            expect.arrayContaining([expect.objectContaining({ backdropFilter: expect.any(String) })])
        );
        expect(screen.getByTestId('custom-band', { includeHiddenElements: true }).children).toHaveLength(2);
    });

    it('builds a blur-layers-only element and a complete default band for the renderer', () => {
        expect.hasAssertions();

        const renderBand = jest.fn<EdgeFadeBandRenderer>(() => null);

        render(<EdgeFade position="top" renderBand={renderBand} />);

        const [[{ blur, defaultBand }]] = renderBand.mock.calls;
        const blurLayers = getLayerStyles(render(<View testID="blur">{blur}</View>).getByTestId('blur'));
        const defaultBandLayers = getLayerStyles(
            render(<View testID="default-band">{defaultBand}</View>).getByTestId('default-band')
        );

        expect(blurLayers).toHaveLength(5);
        expect(blurLayers[0]).toEqual({ flex: 1 });
        expect(blurLayers[4]).toHaveProperty('backdropFilter', 'blur(22.5px) saturate(1.08)');
        expect(defaultBandLayers).toHaveLength(6);
        expect(defaultBandLayers[4]).toHaveProperty('backdropFilter', 'blur(22.5px) saturate(1.08)');
        expect(defaultBandLayers[5]).toMatchObject({ maskImage: TOP_EDGE_MASK, backgroundImage: TOP_WASH });
    });

    it('inherits the provider renderer and prefers the per-instance renderer over it', () => {
        expect.hasAssertions();

        mockContext.renderEdgeFadeBand = () => <View testID="provider-band" />;

        const inherited = render(<EdgeFade position="bottom" />);

        expect(inherited.getByTestId('provider-band', { includeHiddenElements: true })).toBeTruthy();

        const overridden = render(<EdgeFade position="bottom" renderBand={() => <View testID="instance-band" />} />);

        expect(overridden.getByTestId('instance-band', { includeHiddenElements: true })).toBeTruthy();
        expect(overridden.queryByTestId('provider-band', { includeHiddenElements: true })).toBeNull();
    });

    it('fades from the provider external scroll offset instead of the provider-owned one', () => {
        expect.hasAssertions();

        mockScrollY.get.mockReturnValue(0);
        mockContext.externalScrollY = { get: () => 10 } as unknown as SharedValue<number>;

        const screen = render(
            <EdgeFade testID="external-fade" position="top" scrollAnimation={{ opacityInputRange: [0, 20] }} />
        );

        mockContext.externalScrollY = void 0;

        const layers = getLayerStyles(screen.getByTestId('external-fade', { includeHiddenElements: true }));

        expect(layers.map(({ opacity }) => opacity)).toEqual([0.5, 0.5, 0.5, 0.5, 0.5]);
    });
});
