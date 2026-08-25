import { SCREEN_CHROME_SHARED_DEFAULT_CONFIG } from './screen-chrome-shared-default-config.constant';

import type { ScreenChromeConfigInterface } from '../interface/screen-chrome-config.interface';

/**
 * Defines native screen chrome defaults for fade bands, blur, and header backdrop sizing.
 * @see https://github.com/rnw-community/rnw-community/tree/master/packages/react-native-screen-chrome#screenchromedefaultconfig
 */
export const SCREEN_CHROME_DEFAULT_CONFIG: ScreenChromeConfigInterface = {
    ...SCREEN_CHROME_SHARED_DEFAULT_CONFIG,
    topFadeHeight: 150,
    bottomFadeHeight: 150,
    headerBackdropHeight: 220,
};
