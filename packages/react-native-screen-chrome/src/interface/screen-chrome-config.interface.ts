import type { ScreenChromeColorSetInterface } from './screen-chrome-color-set.interface.js';
import type { ScreenChromeMaskStopInterface } from './screen-chrome-mask-stop.interface.js';
import type { ColorSchemeEnum } from '../enum/color-scheme.enum.js';
import type { EdgeFadePosition } from '../type/edge-fade-position.type.js';

/**
 * Configures screen chrome geometry, colors, fade masks, scroll throttling, and collapse thresholds.
 * @see https://github.com/rnw-community/rnw-community/tree/master/packages/react-native-screen-chrome#screenchromeconfiginterface
 */
export interface ScreenChromeConfigInterface {
    readonly headerHeight: number;
    readonly topFadeHeight: number;
    readonly bottomFadeHeight: number;
    readonly headerBackdropHeight: number;
    readonly intensity: number;
    readonly maxBlurIntensity: number;
    readonly collapseStart: number;
    readonly smallTitleStart: number;
    readonly largeTitleEnd: number;
    readonly collapseEnd: number;
    readonly scrollEventThrottle: number;
    readonly snapToCollapse: boolean;
    readonly colors: Readonly<Record<ColorSchemeEnum, ScreenChromeColorSetInterface>>;
    readonly maskStops: Readonly<Record<EdgeFadePosition, Readonly<Record<number, ScreenChromeMaskStopInterface>>>>;
}
