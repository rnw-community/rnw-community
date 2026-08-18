import type { ScreenChromeColorSetInterface } from './screen-chrome-color-set.interface';
import type { EdgeFadePosition } from '../edge-fade/edge-fade-position.type';
import type { ScreenChromeMaskStopInterface } from '../edge-fade/screen-chrome-mask-stop.interface';
import type { ScreenChromeColorScheme } from '../type/screen-chrome-color-scheme.type';

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
    readonly colors: Readonly<Record<ScreenChromeColorScheme, ScreenChromeColorSetInterface>>;
    readonly maskStops: Readonly<Record<EdgeFadePosition, Readonly<Record<number, ScreenChromeMaskStopInterface>>>>;
}
