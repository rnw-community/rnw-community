import { SCREEN_CHROME_DEFAULT_CONFIG } from '../constant/screen-chrome-default-config.constant.js';
import { ColorSchemeEnum } from '../enum/color-scheme.enum.js';

import type { ScreenChromeConfigOverridesInterface } from '../interface/screen-chrome-config-overrides.interface.js';
import type { ScreenChromeConfigInterface } from '../interface/screen-chrome-config.interface.js';
import type { ScreenChromeMaskStopInterface } from '../interface/screen-chrome-mask-stop.interface.js';

const mergeMaskStops = (
    defaults: Readonly<Record<number, ScreenChromeMaskStopInterface>>,
    overrides: Readonly<Record<number, ScreenChromeMaskStopInterface>> | undefined
): Readonly<Record<number, ScreenChromeMaskStopInterface>> =>
    Object.fromEntries(
        Object.entries({ ...defaults, ...overrides }).map(([position, stop]) => [position, { ...stop }])
    );

/**
 * Resolves partial screen chrome overrides into a complete immutable configuration object.
 * @see https://github.com/rnw-community/rnw-community/tree/master/packages/react-native-screen-chrome#mergescreenchromeconfig
 */
export const mergeScreenChromeConfig = (
    overrides: ScreenChromeConfigOverridesInterface = {}
): ScreenChromeConfigInterface => ({
    ...SCREEN_CHROME_DEFAULT_CONFIG,
    ...overrides,
    colors: {
        [ColorSchemeEnum.LIGHT]: {
            ...SCREEN_CHROME_DEFAULT_CONFIG.colors[ColorSchemeEnum.LIGHT],
            ...overrides.colors?.[ColorSchemeEnum.LIGHT],
        },
        [ColorSchemeEnum.DARK]: {
            ...SCREEN_CHROME_DEFAULT_CONFIG.colors[ColorSchemeEnum.DARK],
            ...overrides.colors?.[ColorSchemeEnum.DARK],
        },
    },
    maskStops: {
        top: mergeMaskStops(SCREEN_CHROME_DEFAULT_CONFIG.maskStops.top, overrides.maskStops?.top),
        bottom: mergeMaskStops(SCREEN_CHROME_DEFAULT_CONFIG.maskStops.bottom, overrides.maskStops?.bottom),
    },
});
