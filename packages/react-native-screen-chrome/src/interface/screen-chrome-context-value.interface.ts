import type { ScreenChromeConfigInterface } from './screen-chrome-config.interface';
import type { ColorSchemeEnum } from '../enum/color-scheme.enum';

/**
 * Provides the color scheme and resolved configuration to screen chrome components.
 * @see https://github.com/rnw-community/rnw-community/tree/master/packages/react-native-screen-chrome#screenchromecontextvalueinterface
 */
export interface ScreenChromeContextValueInterface {
    /** Active color scheme selecting the configured color set. */
    readonly colorScheme: ColorSchemeEnum;
    /** Validated configuration merged from defaults and caller overrides. */
    readonly config: ScreenChromeConfigInterface;
}
