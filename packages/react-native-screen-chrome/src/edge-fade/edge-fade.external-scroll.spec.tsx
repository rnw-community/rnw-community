import { describe, expect, it, jest } from '@jest/globals';
import { render } from '@testing-library/react-native';
import React from 'react';
import { View } from 'react-native';

import { SCREEN_CHROME_DEFAULT_CONFIG } from '../constant/screen-chrome-default-config.constant';

import { EdgeFade } from './edge-fade';

import type { ReactNode } from 'react';

const mockConfig = SCREEN_CHROME_DEFAULT_CONFIG;

const MockBlurHost = (props: { readonly children?: ReactNode }): ReactNode => <View testID="edge-fade-blur" {...props} />;
const MockPassthroughHost = ({ children }: { readonly children?: ReactNode }): ReactNode => <View>{children}</View>;

jest.mock('expo-blur', () => ({
    BlurView: (props: { readonly children?: ReactNode }) => MockBlurHost(props),
}));
jest.mock('expo-linear-gradient', () => ({
    LinearGradient: (props: { readonly children?: ReactNode }) => MockPassthroughHost(props),
}));
jest.mock('@react-native-masked-view/masked-view', () => ({
    __esModule: true,
    default: (props: { readonly children?: ReactNode }) => MockPassthroughHost(props),
}));
jest.mock('react-native-safe-area-context', () => ({
    useSafeAreaInsets: () => ({ top: 10, right: 20, bottom: 30, left: 40 }),
}));
jest.mock('../hooks/use-screen-chrome/use-screen-chrome.hook', () => ({
    useScreenChrome: () => ({
        colorScheme: 'light',
        config: mockConfig,
        renderEdgeFadeBand: void 0,
        externalScrollY: { get: () => 40 },
    }),
}));
jest.mock('@rnw-community/react-native-collapsible-header', () => ({
    useCollapsibleHeaderScroll: () => ({ scrollY: { get: () => 0 } }),
}));

describe('EdgeFade native with an external scroll offset', () => {
    it('drives opacity and blur intensity from the provider external scroll offset instead of the provider-owned one', () => {
        expect.hasAssertions();

        const screen = render(
            <EdgeFade
                testID="external-fade"
                position="top"
                scrollAnimation={{ opacityInputRange: [0, 80], intensityInputRange: [0, 80], maxIntensity: 60 }}
            />
        );

        expect(screen.getByTestId('external-fade', { includeHiddenElements: true })).toHaveStyle({ opacity: 0.5 });
        expect(screen.getByTestId('edge-fade-blur', { includeHiddenElements: true })).toHaveProp('intensity', 30);
    });
});
