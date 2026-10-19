import type { ScreenChromeColorScheme } from './screen-chrome-color-scheme.type';

/**
 * Selects a fixed chrome palette, or `'system'` to follow the device appearance at render time.
 * @see https://github.com/rnw-community/rnw-community/tree/master/packages/react-native-screen-chrome#screenchromecolorschemepreference
 */
export type ScreenChromeColorSchemePreference = ScreenChromeColorScheme | 'system';
