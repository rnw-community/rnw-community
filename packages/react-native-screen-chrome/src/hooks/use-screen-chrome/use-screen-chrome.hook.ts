import { useContext } from 'react';

import { isDefined } from '@rnw-community/shared';

import { ScreenChromeContext } from '../../context/screen-chrome.context';

import type { ScreenChromeContextValueInterface } from '../../interface/screen-chrome-context-value.interface';

/**
 * Reads the nearest screen chrome context and fails fast when no provider is mounted.
 * @see https://github.com/rnw-community/rnw-community/tree/master/packages/react-native-screen-chrome#usescreenchrome
 */
export const useScreenChrome = (): ScreenChromeContextValueInterface => {
    const context = useContext(ScreenChromeContext);

    if (!isDefined(context)) {
        throw new Error('useScreenChrome must be used within ScreenChromeProvider');
    }

    return context;
};
