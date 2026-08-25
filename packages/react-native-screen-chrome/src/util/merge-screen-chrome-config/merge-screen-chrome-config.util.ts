import { SCREEN_CHROME_DEFAULT_CONFIG } from '../../constant/screen-chrome-default-config.constant';

import type { ScreenChromeMaskStopInterface } from '../../edge-fade/screen-chrome-mask-stop.interface';
import type { ScreenChromeConfigOverridesInterface } from '../../interface/screen-chrome-config-overrides.interface';
import type { ScreenChromeConfigInterface } from '../../interface/screen-chrome-config.interface';

const mergeMaskStops = (
    defaults: Readonly<Record<number, ScreenChromeMaskStopInterface>>,
    overrides: Readonly<Record<number, ScreenChromeMaskStopInterface>> | undefined
): Readonly<Record<number, ScreenChromeMaskStopInterface>> =>
    Object.fromEntries(Object.entries({ ...defaults, ...overrides }).map(([position, stop]) => [position, { ...stop }]));

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
        light: {
            ...SCREEN_CHROME_DEFAULT_CONFIG.colors.light,
            ...overrides.colors?.light,
        },
        dark: {
            ...SCREEN_CHROME_DEFAULT_CONFIG.colors.dark,
            ...overrides.colors?.dark,
        },
    },
    maskStops: {
        top: mergeMaskStops(SCREEN_CHROME_DEFAULT_CONFIG.maskStops.top, overrides.maskStops?.top),
        bottom: mergeMaskStops(SCREEN_CHROME_DEFAULT_CONFIG.maskStops.bottom, overrides.maskStops?.bottom),
    },
});
