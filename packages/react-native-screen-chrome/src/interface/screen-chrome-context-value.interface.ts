import type { ScreenChromeConfigInterface } from './screen-chrome-config.interface';
import type { ScreenChromeColorScheme } from '../type/screen-chrome-color-scheme.type';

/**
 * Provides the color scheme and resolved configuration to screen chrome components.
 * @see https://github.com/rnw-community/rnw-community/tree/master/packages/react-native-screen-chrome#screenchromecontextvalueinterface
 */
export interface ScreenChromeContextValueInterface {
    /** Active color scheme selecting the configured color set. */
    readonly colorScheme: ScreenChromeColorScheme;
    /** Validated configuration merged from defaults and caller overrides. */
    readonly config: ScreenChromeConfigInterface;
}
