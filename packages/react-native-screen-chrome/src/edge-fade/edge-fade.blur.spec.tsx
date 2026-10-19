import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { render } from '@testing-library/react-native';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { CollapsibleHeaderBackdrop } from '../collapsible-header-backdrop/collapsible-header-backdrop';
import { SCREEN_CHROME_DEFAULT_CONFIG } from '../constant/screen-chrome-default-config.constant';

import { EdgeFade } from './edge-fade';

import type { EdgeFadeBandRenderer } from './edge-fade-band-renderer.type';
import type { EdgeFadePropsInterface } from './edge-fade-props.interface';
import type { ScreenChromeConfigInterface } from '../interface/screen-chrome-config.interface';
import type { ScreenChromeColorScheme } from '../type/screen-chrome-color-scheme.type';
import type { RenderResult } from '@testing-library/react-native';
import type { ComponentRef, ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import type { ReactTestInstance } from 'react-test-renderer';

interface MockHostProps {
    readonly children?: ReactNode;
    readonly maskElement?: ReactNode;
}

const mockScrollY = { get: jest.fn(() => 0) };
let mockConfig: ScreenChromeConfigInterface = SCREEN_CHROME_DEFAULT_CONFIG;
let mockColorScheme: ScreenChromeColorScheme = 'light';

const MockBlurHost = (props: MockHostProps): ReactNode => <View testID="blur-host" {...props} />;
const MockGradientHost = (props: MockHostProps): ReactNode => <View testID="gradient-host" {...props} />;
const MockMaskedHost = ({ children, maskElement }: MockHostProps): ReactNode => (
    <View testID="mask-host">
        <View testID="mask-element">{maskElement}</View>
        {children}
    </View>
);

jest.mock('expo-blur', () => ({ BlurView: (props: MockHostProps) => MockBlurHost(props) }));
jest.mock('expo-linear-gradient', () => ({ LinearGradient: (props: MockHostProps) => MockGradientHost(props) }));
jest.mock('@react-native-masked-view/masked-view', () => ({
    __esModule: true,
    default: (props: MockHostProps) => MockMaskedHost(props),
}));
jest.mock('react-native-safe-area-context', () => ({
    useSafeAreaInsets: () => ({ top: 10, right: 0, bottom: 30, left: 0 }),
}));
jest.mock('../hooks/use-screen-chrome/use-screen-chrome.hook', () => ({
    useScreenChrome: () => ({ colorScheme: mockColorScheme, config: mockConfig, renderEdgeFadeBand: void 0 }),
}));
jest.mock('@rnw-community/react-native-collapsible-header', () => ({
    useCollapsibleHeaderScroll: () => ({ scrollY: mockScrollY }),
}));

interface HostProps {
    readonly testID?: string;
    readonly intensity?: number;
    readonly tint?: string;
    readonly blurMethod?: string;
    readonly locations?: readonly number[];
    readonly style?: StyleProp<ViewStyle>;
}

const hidden = { includeHiddenElements: true };

const hostProps = (instance: ReactTestInstance): HostProps => instance.props;
const SLICE_RATIOS_FROM_EDGE = [1, 1 / 2, 1 / 4, 1 / 8];
const SLICE_OFFSETS_FROM_EDGE = ['0%', '25%', '50%', '75%'];

const getBlurHosts = (screen: RenderResult): ReactTestInstance[] => screen.getAllByTestId('blur-host', hidden);

const getHostTestIds = (screen: RenderResult): unknown[] =>
    screen.UNSAFE_root.findAll(node => typeof node.type === 'string').map(node => hostProps(node).testID);

const getAncestorTestIds = (instance: ReactTestInstance): string[] => {
    const testIds: string[] = [];

    for (let ancestor = instance.parent; ancestor !== null; ancestor = ancestor.parent) {
        testIds.push(String(hostProps(ancestor).testID));
    }

    return testIds;
};

const expectBlurOutsideEveryMask = (screen: RenderResult): void => {
    for (const blurHost of getBlurHosts(screen)) {
        expect(getAncestorTestIds(blurHost)).not.toContain('mask-host');
    }
};

const expectSliceIntensities = (screen: RenderResult, edgeIntensity: number): void => {
    expect(getBlurHosts(screen).map(blurHost => hostProps(blurHost).intensity)).toStrictEqual(
        SLICE_RATIOS_FROM_EDGE.map(ratio => edgeIntensity * ratio)
    );
};

const expectSlicesAnchoredTo = (screen: RenderResult, position: EdgeFadePropsInterface['position']): void => {
    expect(getBlurHosts(screen).map(blurHost => StyleSheet.flatten(hostProps(blurHost).style))).toStrictEqual(
        SLICE_OFFSETS_FROM_EDGE.map(offset => ({
            position: 'absolute',
            left: 0,
            right: 0,
            height: '25%',
            [position]: offset,
        }))
    );
};

beforeEach(() => {
    mockConfig = SCREEN_CHROME_DEFAULT_CONFIG;
    mockColorScheme = 'light';
    mockScrollY.get.mockReturnValue(0);
});

describe.each(['top', 'bottom'] as const)('EdgeFade native %s blur', position => {
    it('renders edge-anchored slices halving the default intensity beneath and outside the wash mask', () => {
        expect.hasAssertions();

        const screen = render(<EdgeFade position={position} />);
        const hostTestIds = getHostTestIds(screen);

        expect(getBlurHosts(screen)).toHaveLength(4);
        expectSliceIntensities(screen, mockConfig.intensity);
        expectSlicesAnchoredTo(screen, position);
        expectBlurOutsideEveryMask(screen);
        expect(hostTestIds.lastIndexOf('blur-host')).toBeLessThan(hostTestIds.indexOf('mask-host'));
    });

    it('applies a custom static intensity, ignoring the scroll offset when no scroll animation is set', () => {
        expect.hasAssertions();

        mockScrollY.get.mockReturnValue(500);

        const customIntensity = 64;
        const screen = render(<EdgeFade position={position} intensity={customIntensity} />);

        expectSliceIntensities(screen, customIntensity);
        expectBlurOutsideEveryMask(screen);
    });

    it.each([
        [0, 60, 0],
        [40, 60, 30],
        [80, 60, 60],
        [400, 60, 60],
        [80, void 0, SCREEN_CHROME_DEFAULT_CONFIG.maxBlurIntensity],
    ])('ramps the animated intensity on the blur hosts at offset %d toward max %s', (offset, maxIntensity, edge) => {
        expect.hasAssertions();

        mockScrollY.get.mockReturnValue(offset);

        const screen = render(
            <EdgeFade position={position} scrollAnimation={{ intensityInputRange: [0, 80], maxIntensity }} />
        );

        expectSliceIntensities(screen, edge);
        expectBlurOutsideEveryMask(screen);
    });

    it('keeps the static intensity animated when the scroll animation only fades opacity', () => {
        expect.hasAssertions();

        mockScrollY.get.mockReturnValue(40);

        const screen = render(
            <EdgeFade testID="band" position={position} intensity={48} scrollAnimation={{ opacityInputRange: [0, 80] }} />
        );

        expect(screen.getByTestId('band', hidden)).toHaveStyle({ opacity: 0.5 });
        expectSliceIntensities(screen, 48);
    });
});

describe.each(['top', 'bottom'] as const)('EdgeFade native %s blur configuration', position => {
    it.each<[ScreenChromeColorScheme, string]>([
        ['light', 'systemChromeMaterialLight'],
        ['dark', 'systemThinMaterialDark'],
    ])('tints every %s slice for the color scheme', (colorScheme, tint) => {
        expect.hasAssertions();

        mockColorScheme = colorScheme;

        const screen = render(<EdgeFade position={position} />);

        expect(getBlurHosts(screen).map(blurHost => hostProps(blurHost).tint)).toStrictEqual(Array(4).fill(tint));
    });

    it.each([
        ['no blur target or method', {}, 'none', false],
        ['a blur target', { blurTarget: React.createRef<ComponentRef<typeof View>>() }, 'dimezisBlurView', true],
        ['an explicit blur method', { blurMethod: 'dimezisBlurViewSdk31Plus' as const }, 'dimezisBlurViewSdk31Plus', false],
    ])('resolves the blur method on every slice with %s', (_name, blurProps, blurMethod, hasBlurTarget) => {
        expect.hasAssertions();

        const screen = render(<EdgeFade position={position} {...blurProps} />);

        for (const blurHost of getBlurHosts(screen)) {
            expect(hostProps(blurHost).blurMethod).toBe(blurMethod);
            expect('blurTarget' in hostProps(blurHost)).toBe(hasBlurTarget);
        }
    });

    it('feeds custom mask stops to the wash mask without moving the blur inside it', () => {
        expect.hasAssertions();

        const topKnee = 0.3;
        const bottomKnee = 0.7;

        mockConfig = {
            ...SCREEN_CHROME_DEFAULT_CONFIG,
            maskStops: {
                top: { 0: { color: '#000000' }, [topKnee]: { color: 'rgba(0,0,0,0.5)' }, 1: { color: 'transparent' } },
                bottom: { 0: { color: 'transparent' }, [bottomKnee]: { color: 'rgba(0,0,0,0.5)' }, 1: { color: '#000000' } },
            },
        };

        const screen = render(<EdgeFade position={position} />);
        const [mask] = screen.getByTestId('mask-element', hidden).findAllByProps({ testID: 'gradient-host' });

        expect(hostProps(mask).locations).toStrictEqual(position === 'top' ? [0, topKnee, 1] : [0, bottomKnee, 1]);
        expectSliceIntensities(screen, mockConfig.intensity);
        expectBlurOutsideEveryMask(screen);
    });

    it('hands a custom renderer the sliced blur with its resolved intensity', () => {
        expect.hasAssertions();

        mockScrollY.get.mockReturnValue(80);

        const renderBand: EdgeFadeBandRenderer = ({ blur }) => <View testID="custom-band">{blur}</View>;
        const screen = render(
            <EdgeFade
                position={position}
                renderBand={renderBand}
                scrollAnimation={{ intensityInputRange: [0, 80], maxIntensity: 40 }}
            />
        );

        expect(getAncestorTestIds(getBlurHosts(screen)[0])).toContain('custom-band');
        expectSliceIntensities(screen, 40);
        expectBlurOutsideEveryMask(screen);
    });
});

describe('CollapsibleHeaderBackdrop native blur', () => {
    it('ramps the header backdrop blur to the provider max intensity once the header collapses', () => {
        expect.hasAssertions();

        mockScrollY.get.mockReturnValue(mockConfig.collapseEnd);

        const screen = render(<CollapsibleHeaderBackdrop testID="backdrop" />);

        expect(screen.getByTestId('backdrop', hidden)).toHaveStyle({ opacity: 1 });
        expectSliceIntensities(screen, mockConfig.maxBlurIntensity);
        expectSlicesAnchoredTo(screen, 'top');
        expectBlurOutsideEveryMask(screen);
    });
});
