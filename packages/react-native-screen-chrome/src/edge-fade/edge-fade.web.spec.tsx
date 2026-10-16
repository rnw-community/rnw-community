import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { render } from '@testing-library/react-native';
import React from 'react';
import { View } from 'react-native';

import { SCREEN_CHROME_DEFAULT_CONFIG } from '../constant/screen-chrome-default-config.constant.web';

import { EdgeFade } from './edge-fade.web';

import type { EdgeFadeBandRenderer } from './edge-fade-band-renderer.type';
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

describe('EdgeFade web', () => {
    it('renders the web defaults with ordered CSS masks and a static top blur', () => {
        expect.hasAssertions();

        const screen = render(<EdgeFade testID="top-fade" position="top" blurMethod="dimezisBlurView" />);
        const fade = screen.getByTestId('top-fade', { includeHiddenElements: true });

        expect(fade.props).not.toHaveProperty('blurMethod');
        expect(fade.props).not.toHaveProperty('blurTarget');
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

    it('builds a backdrop-only blur and a complete default band for the renderer', () => {
        expect.hasAssertions();

        const renderBand = jest.fn<EdgeFadeBandRenderer>(() => null);

        render(<EdgeFade position="top" renderBand={renderBand} />);

        const [[{ blur, defaultBand }]] = renderBand.mock.calls;

        expect(blur).toHaveProperty('props.style', [
            { flex: 1 },
            { backdropFilter: 'blur(22.5px) saturate(1.08)', WebkitBackdropFilter: 'blur(22.5px) saturate(1.08)' },
        ]);
        expect(defaultBand).toHaveProperty('props.style', [
            { flex: 1 },
            expect.objectContaining({
                backdropFilter: 'blur(22.5px) saturate(1.08)',
                maskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.99) 0%, #000000 50%, transparent 100%)',
            }),
        ]);
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

        expect(screen.getByTestId('external-fade', { includeHiddenElements: true })).toHaveStyle({ opacity: 0.5 });
    });
});
