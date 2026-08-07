import type { ScreenChromeColorSetInterface } from './screen-chrome-color-set.interface.js';
import type { ScreenChromeConfigInterface } from './screen-chrome-config.interface.js';
import type { ScreenChromeMaskStopInterface } from './screen-chrome-mask-stop.interface.js';
import type { ColorSchemeEnum } from '../enum/color-scheme.enum.js';
import type { EdgeFadePosition } from '../type/edge-fade-position.type.js';

/**
 * Overrides selected screen chrome defaults while preserving nested color schemes and mask-stop records.
 * @see https://github.com/rnw-community/rnw-community/tree/master/packages/react-native-screen-chrome#screenchromeconfigoverridesinterface
 */
export interface ScreenChromeConfigOverridesInterface extends Partial<
    Omit<ScreenChromeConfigInterface, 'colors' | 'maskStops'>
> {
    readonly colors?: Partial<Readonly<Record<ColorSchemeEnum, Partial<ScreenChromeColorSetInterface>>>>;
    readonly maskStops?: Partial<
        Readonly<Record<EdgeFadePosition, Readonly<Record<number, ScreenChromeMaskStopInterface>>>>
    >;
}
