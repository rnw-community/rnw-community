import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { render } from '@testing-library/react-native';
import React from 'react';
import { View } from 'react-native';

import { SCREEN_CHROME_DEFAULT_CONFIG } from '../constant/screen-chrome-default-config.constant';

import { EdgeFade } from './edge-fade';

import type { EdgeFadeBandRenderer } from './edge-fade-band-renderer.type';
import type { ScreenChromeColorScheme } from '../type/screen-chrome-color-scheme.type';
import type { ReactNode } from 'react';

const mockScrollY = { get: jest.fn(() => 0) };
const mockConfig = SCREEN_CHROME_DEFAULT_CONFIG;
let mockColorScheme: ScreenChromeColorScheme = 'light';
let mockRenderEdgeFadeBand: EdgeFadeBandRenderer | undefined = void 0;

const MockBlurHost = (props: { readonly children?: ReactNode; readonly maskElement?: ReactNode }): ReactNode => (
    <View testID="edge-fade-blur" {...props} />
);
const MockGradientHost = (props: { readonly children?: ReactNode; readonly maskElement?: ReactNode }): ReactNode => (
    <View testID="edge-fade-gradient" {...props} />
);
const MockMaskedHost = ({
    children,
    maskElement,
}: {
    readonly children?: ReactNode;
    readonly maskElement?: ReactNode;
}): ReactNode => (
    <View testID="edge-fade-mask">
        {maskElement}
        {children}
    </View>
);

jest.mock('expo-blur', () => ({
    BlurView: (props: { readonly children?: ReactNode; readonly maskElement?: ReactNode }) => MockBlurHost(props),
}));
jest.mock('expo-linear-gradient', () => ({
    LinearGradient: (props: { readonly children?: ReactNode; readonly maskElement?: ReactNode }) => MockGradientHost(props),
}));
jest.mock('@react-native-masked-view/masked-view', () => ({
    __esModule: true,
    default: (props: { readonly children?: ReactNode; readonly maskElement?: ReactNode }) => MockMaskedHost(props),
}));
jest.mock('react-native-safe-area-context', () => ({
    useSafeAreaInsets: () => ({ top: 10, right: 20, bottom: 30, left: 40 }),
}));
jest.mock('../hooks/use-screen-chrome/use-screen-chrome.hook', () => ({
    useScreenChrome: () => ({
        colorScheme: mockColorScheme,
        config: mockConfig,
        renderEdgeFadeBand: mockRenderEdgeFadeBand,
    }),
}));
jest.mock('@rnw-community/react-native-collapsible-header', () => ({
    useCollapsibleHeaderScroll: () => ({ scrollY: mockScrollY }),
}));

beforeEach(() => {
    mockColorScheme = 'light';
    mockRenderEdgeFadeBand = void 0;
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
        const blur = screen.getByTestId('edge-fade-blur', { includeHiddenElements: true });

        expect(blur).toHaveProp('intensity', 0);
        expect(blur).toHaveProp('tint', 'systemChromeMaterialLight');
        expect(blur).toHaveProp('blurMethod', 'none');
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
        const blur = screen.getByTestId('edge-fade-blur', { includeHiddenElements: true });

        expect(fade).toHaveStyle({ height: 180, bottom: -30, opacity: 0.5 });
        expect(blur).toHaveProp('intensity', 30);
        expect(blur).toHaveProp('tint', 'systemThinMaterialDark');
        expect(blur).toHaveProp('blurMethod', 'none');
    });

    it('opts into the Android blur method only once a blur target is supplied', () => {
        expect.hasAssertions();

        const blurTarget = React.createRef<View>();
        const targeted = render(<EdgeFade position="top" blurTarget={blurTarget} />);

        expect(targeted.getByTestId('edge-fade-blur', { includeHiddenElements: true })).toHaveProp(
            'blurMethod',
            'dimezisBlurView'
        );

        const untargeted = render(<EdgeFade position="top" />);

        expect(untargeted.getByTestId('edge-fade-blur', { includeHiddenElements: true })).toHaveProp('blurMethod', 'none');
    });

    it('fades the blur and color wash out through the configured edge mask', () => {
        expect.hasAssertions();

        const screen = render(<EdgeFade position="top" />);
        const [mask, wash] = screen.getAllByTestId('edge-fade-gradient', { includeHiddenElements: true });

        expect(mask).toHaveProp('colors', ['rgba(0,0,0,0.99)', '#000000', 'transparent']);
        expect(mask).toHaveProp('locations', [0, 0.5, 1]);
        expect(wash).toHaveProp('colors', [mockConfig.colors.light.solid, mockConfig.colors.light.wash]);
    });
});

describe('EdgeFade native band renderer', () => {
    it('hands the resolved band visuals to a per-instance renderer inside the inert animated container', () => {
        expect.hasAssertions();

        mockScrollY.get.mockReturnValue(40);

        const renderBand = jest.fn<EdgeFadeBandRenderer>(({ blur }) => <View testID="custom-band">{blur}</View>);
        const screen = render(
            <EdgeFade
                testID="top-fade"
                position="top"
                renderBand={renderBand}
                scrollAnimation={{ opacityInputRange: [0, 80], intensityInputRange: [0, 80], maxIntensity: 60 }}
            />
        );
        const fade = screen.getByTestId('top-fade', { includeHiddenElements: true });

        expect(renderBand).toHaveBeenCalledWith(
            expect.objectContaining({
                position: 'top',
                colorScheme: 'light',
                height: 160,
                tint: 'systemChromeMaterialLight',
                washColors: [mockConfig.colors.light.solid, mockConfig.colors.light.wash],
                maskColors: ['rgba(0,0,0,0.99)', '#000000', 'transparent'],
                maskLocations: [0, 0.5, 1],
            })
        );
        expect(fade).toHaveProp('pointerEvents', 'none');
        expect(fade).toHaveStyle({ height: 160, top: -10, opacity: 0.5 });
        expect(screen.getByTestId('custom-band', { includeHiddenElements: true })).toBeTruthy();
        expect(screen.getByTestId('edge-fade-blur', { includeHiddenElements: true })).toHaveProp('intensity', 30);
        expect(screen.queryByTestId('edge-fade-mask', { includeHiddenElements: true })).toBeNull();
        expect(screen.queryByTestId('edge-fade-gradient', { includeHiddenElements: true })).toBeNull();
    });

    it('lets a renderer wrap the default band', () => {
        expect.hasAssertions();

        const screen = render(
            <EdgeFade position="bottom" renderBand={({ defaultBand }) => <View testID="wrapper">{defaultBand}</View>} />
        );

        expect(screen.getByTestId('wrapper', { includeHiddenElements: true })).toBeTruthy();
        expect(screen.getByTestId('edge-fade-mask', { includeHiddenElements: true })).toBeTruthy();
        expect(screen.getAllByTestId('edge-fade-gradient', { includeHiddenElements: true })).toHaveLength(2);
    });

    it('renders nothing inside the container when a renderer returns null', () => {
        expect.hasAssertions();

        const screen = render(<EdgeFade testID="top-fade" position="top" renderBand={() => null} />);

        expect(screen.getByTestId('top-fade', { includeHiddenElements: true }).children).toHaveLength(0);
    });

    it('inherits the provider renderer and prefers the per-instance renderer over it', () => {
        expect.hasAssertions();

        mockRenderEdgeFadeBand = () => <View testID="provider-band" />;

        const inherited = render(<EdgeFade position="top" />);

        expect(inherited.getByTestId('provider-band', { includeHiddenElements: true })).toBeTruthy();
        expect(inherited.queryByTestId('edge-fade-blur', { includeHiddenElements: true })).toBeNull();

        const overridden = render(<EdgeFade position="top" renderBand={() => <View testID="instance-band" />} />);

        expect(overridden.getByTestId('instance-band', { includeHiddenElements: true })).toBeTruthy();
        expect(overridden.queryByTestId('provider-band', { includeHiddenElements: true })).toBeNull();
    });
});
