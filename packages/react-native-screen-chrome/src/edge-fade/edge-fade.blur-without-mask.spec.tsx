import { describe, expect, it, jest } from '@jest/globals';
import { render } from '@testing-library/react-native';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { isDefined } from '@rnw-community/shared';

import { SCREEN_CHROME_DEFAULT_CONFIG } from '../constant/screen-chrome-default-config.constant';

import { EdgeFade } from './edge-fade';
import { buildBackgroundImage } from './util/build-background-image/build-background-image.util';

import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import type { ReactTestInstance } from 'react-test-renderer';

const mockConfig = SCREEN_CHROME_DEFAULT_CONFIG;

interface HostProps {
    readonly testID?: string;
    readonly intensity?: number;
    readonly style?: StyleProp<ViewStyle>;
}

const hostProps = (instance: ReactTestInstance): HostProps => instance.props;

const MockBlurHost = (props: { readonly children?: ReactNode }): ReactNode => <View testID="blur-host" {...props} />;

jest.mock('@sbaiahmed1/react-native-blur', () => {
    throw new Error("Cannot find module '@sbaiahmed1/react-native-blur'");
});
jest.mock('expo-blur', () => ({ BlurView: (props: { readonly children?: ReactNode }) => MockBlurHost(props) }));
jest.mock('expo-linear-gradient', () => {
    throw new Error("Cannot find module 'expo-linear-gradient'");
});
jest.mock('@react-native-masked-view/masked-view', () => {
    throw new Error("Cannot find module '@react-native-masked-view/masked-view'");
});
jest.mock('react-native-safe-area-context', () => ({
    useSafeAreaInsets: () => ({ top: 10, right: 0, bottom: 30, left: 0 }),
}));
jest.mock('../hooks/use-screen-chrome/use-screen-chrome.hook', () => ({
    useScreenChrome: () => ({ colorScheme: 'light', config: mockConfig, renderEdgeFadeBand: void 0 }),
}));
jest.mock('@rnw-community/react-native-collapsible-header', () => ({
    useCollapsibleHeaderScroll: () => ({ scrollY: { get: () => 0 } }),
}));

describe('EdgeFade with expo-blur but without the mask and gradient modules', () => {
    it('keeps the sliced blur under the CSS-gradient wash', () => {
        expect.hasAssertions();

        const screen = render(<EdgeFade position="top" />);
        const hosts = screen.UNSAFE_root.findAll(node => typeof node.type === 'string');
        const blurHosts = hosts.filter(host => hostProps(host).testID === 'blur-host');
        const washIndex = hosts.findIndex(host =>
            isDefined(StyleSheet.flatten([hostProps(host).style])?.experimental_backgroundImage)
        );

        expect(blurHosts.map(blurHost => hostProps(blurHost).intensity)).toStrictEqual(
            [1, 1 / 2, 1 / 4, 1 / 8].map(ratio => mockConfig.intensity * ratio)
        );
        expect(hosts.indexOf(blurHosts[blurHosts.length - 1])).toBeLessThan(washIndex);
        expect(StyleSheet.flatten(hostProps(hosts[washIndex]).style)).toStrictEqual({
            position: 'absolute',
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
            experimental_backgroundImage: buildBackgroundImage(mockConfig.colors.light, 'top'),
        });
    });
});
