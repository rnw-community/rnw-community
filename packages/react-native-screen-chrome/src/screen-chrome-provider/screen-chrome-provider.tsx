import React from 'react';

import { CollapsibleHeaderProvider } from '@rnw-community/react-native-collapsible-header';

import { ScreenChromeContext } from '../context/screen-chrome.context';
import { ColorSchemeEnum } from '../enum/color-scheme.enum';
import { assertValidScreenChromeConfig } from '../utils/assert-valid-screen-chrome-config.util';
import { mergeScreenChromeConfig } from '../utils/merge-screen-chrome-config.util';

import type { ScreenChromeConfigOverridesInterface } from '../interface/screen-chrome-config-overrides.interface';
import type { ReactNode } from 'react';

interface Props {
    readonly children: ReactNode;
    readonly colorScheme?: ColorSchemeEnum;
    readonly config?: ScreenChromeConfigOverridesInterface;
}

/**
 * Provides validated configuration and color scheme to screen chrome components around one scrollable.
 * @see https://github.com/rnw-community/rnw-community/tree/master/packages/react-native-screen-chrome#screenchromeprovider
 */
export const ScreenChromeProvider = ({ children, colorScheme = ColorSchemeEnum.LIGHT, config }: Props): ReactNode => {
    const resolvedConfig = mergeScreenChromeConfig(config);

    assertValidScreenChromeConfig(resolvedConfig);

    return (
        <CollapsibleHeaderProvider>
            <ScreenChromeContext.Provider value={{ colorScheme, config: resolvedConfig }}>
                {children}
            </ScreenChromeContext.Provider>
        </CollapsibleHeaderProvider>
    );
};
