import { describe, expect, it, jest } from '@jest/globals';
import { render } from '@testing-library/react-native';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { SCREEN_CHROME_DEFAULT_CONFIG } from '../constant/screen-chrome-default-config.constant';

import { EdgeFade } from './edge-fade';
import { buildBackgroundImage } from './util/build-background-image/build-background-image.util';

import type { EdgeFadeBandRenderPropsInterface } from './edge-fade-band-render-props.interface';
import type { ViewProps } from 'react-native';

const mockConfig = SCREEN_CHROME_DEFAULT_CONFIG;

jest.mock('@sbaiahmed1/react-native-blur', () => ({}));
jest.mock('expo-blur', () => {
    throw new Error("Cannot find module 'expo-blur'");
});
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
    useScreenChrome: () => ({ colorScheme: 'dark', config: mockConfig, renderEdgeFadeBand: void 0 }),
}));
jest.mock('@rnw-community/react-native-collapsible-header', () => ({
    useCollapsibleHeaderScroll: () => ({ scrollY: { get: () => 0 } }),
}));

describe('EdgeFade without the optional blur, gradient, and mask modules', () => {
    it('paints the wash as a CSS gradient on a plain view instead of crashing', () => {
        expect.hasAssertions();

        const screen = render(<EdgeFade testID="bottom-fade" position="bottom" />);
        const fade = screen.getByTestId('bottom-fade', { includeHiddenElements: true });
        const bandStyles = screen
            .UNSAFE_getAllByType(View)
            .map(({ props }: { readonly props: ViewProps }) => StyleSheet.flatten(props.style));

        expect(fade).toHaveStyle({ height: mockConfig.bottomFadeHeight + 30, bottom: 0 });
        expect(bandStyles).toContainEqual({
            position: 'absolute',
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
            experimental_backgroundImage: buildBackgroundImage(mockConfig.colors.dark, 'bottom'),
        });
    });

    it('hands a band renderer an empty blur element next to the CSS gradient band', () => {
        expect.hasAssertions();

        const renderBand = jest.fn(({ blur, defaultBand }: EdgeFadeBandRenderPropsInterface) => (
            <View testID="custom-band">
                {blur}
                {defaultBand}
            </View>
        ));
        const screen = render(<EdgeFade position="top" renderBand={renderBand} />);
        const [[{ blur }]] = renderBand.mock.calls;

        expect(blur).toBeDefined();
        expect(screen.getByTestId('custom-band', { includeHiddenElements: true }).findAllByType(View)).toHaveLength(2);
    });
});
