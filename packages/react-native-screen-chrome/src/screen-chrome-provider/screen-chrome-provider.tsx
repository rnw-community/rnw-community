import React from 'react';

import { CollapsibleHeaderProvider } from '@rnw-community/react-native-collapsible-header';

import { ScreenChromeContext } from '../context/screen-chrome.context';
import { assertValidScreenChromeConfig } from '../util/assert-valid-screen-chrome-config/assert-valid-screen-chrome-config.util';
import { mergeScreenChromeConfig } from '../util/merge-screen-chrome-config/merge-screen-chrome-config.util';

import type { ScreenChromeConfigOverridesInterface } from '../interface/screen-chrome-config-overrides.interface';
import type { ScreenChromeColorScheme } from '../type/screen-chrome-color-scheme.type';
import type { ReactNode } from 'react';

interface Props {
    readonly children: ReactNode;
    readonly colorScheme?: ScreenChromeColorScheme;
    readonly config?: ScreenChromeConfigOverridesInterface;
    readonly syncNativeScrollOffset?: boolean;
}

/**
 * Provides validated configuration and color scheme to screen chrome components around one scrollable.
 * @see https://github.com/rnw-community/rnw-community/tree/master/packages/react-native-screen-chrome#screenchromeprovider
 */
export const ScreenChromeProvider = ({ children, colorScheme = 'light', config, syncNativeScrollOffset }: Props): ReactNode => {
    const resolvedConfig = mergeScreenChromeConfig(config);

    assertValidScreenChromeConfig(resolvedConfig);

    return (
        <CollapsibleHeaderProvider syncNativeScrollOffset={syncNativeScrollOffset}>
            <ScreenChromeContext.Provider value={{ colorScheme, config: resolvedConfig }}>
                {children}
            </ScreenChromeContext.Provider>
        </CollapsibleHeaderProvider>
    );
};
