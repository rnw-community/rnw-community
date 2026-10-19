import React from 'react';
import { useColorScheme } from 'react-native';

import { CollapsibleHeaderProvider } from '@rnw-community/react-native-collapsible-header';

import { assertScreenChromeScrollSource } from '../assert/assert-screen-chrome-scroll-source/assert-screen-chrome-scroll-source.assert';
import { ScreenChromeContext } from '../context/screen-chrome.context';
import { assertValidScreenChromeConfig } from '../util/assert-valid-screen-chrome-config/assert-valid-screen-chrome-config.util';
import { mergeScreenChromeConfig } from '../util/merge-screen-chrome-config/merge-screen-chrome-config.util';
import { resolveScreenChromeColorScheme } from '../util/resolve-screen-chrome-color-scheme/resolve-screen-chrome-color-scheme.util';

import type { EdgeFadeBandRenderer } from '../edge-fade/edge-fade-band-renderer.type';
import type { ScreenChromeConfigOverridesInterface } from '../interface/screen-chrome-config-overrides.interface';
import type { ScreenChromeColorSchemePreference } from '../type/screen-chrome-color-scheme-preference.type';
import type { ReactNode } from 'react';
import type { SharedValue } from 'react-native-reanimated';

interface Props {
    readonly children: ReactNode;
    readonly colorScheme?: ScreenChromeColorSchemePreference;
    readonly config?: ScreenChromeConfigOverridesInterface;
    readonly syncNativeScrollOffset?: boolean;
    readonly renderEdgeFadeBand?: EdgeFadeBandRenderer;
    readonly scrollY?: SharedValue<number>;
}

/**
 * Provides validated configuration and color scheme to screen chrome components around one scrollable.
 * @see https://github.com/rnw-community/rnw-community/tree/master/packages/react-native-screen-chrome#screenchromeprovider
 */
export const ScreenChromeProvider = ({
    children,
    colorScheme = 'light',
    config,
    syncNativeScrollOffset,
    renderEdgeFadeBand,
    scrollY,
}: Props): ReactNode => {
    const systemColorScheme = useColorScheme();
    const resolvedColorScheme = resolveScreenChromeColorScheme(colorScheme, systemColorScheme);
    const resolvedConfig = mergeScreenChromeConfig(config);

    assertValidScreenChromeConfig(resolvedConfig);

    assertScreenChromeScrollSource(resolvedConfig.snapToCollapse, scrollY);

    return (
        <CollapsibleHeaderProvider syncNativeScrollOffset={syncNativeScrollOffset}>
            <ScreenChromeContext.Provider
                value={{
                    colorScheme: resolvedColorScheme,
                    config: resolvedConfig,
                    renderEdgeFadeBand,
                    externalScrollY: scrollY,
                }}
            >
                {children}
            </ScreenChromeContext.Provider>
        </CollapsibleHeaderProvider>
    );
};
