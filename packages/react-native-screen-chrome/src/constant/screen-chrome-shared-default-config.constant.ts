import type { ScreenChromeConfigInterface } from '../interface/screen-chrome-config.interface';

/**
 * Defines platform-independent screen chrome defaults shared by native and web.
 * @see https://github.com/rnw-community/rnw-community/tree/master/packages/react-native-screen-chrome#screenchromeshareddefaultconfig
 */
export const SCREEN_CHROME_SHARED_DEFAULT_CONFIG: Omit<
    ScreenChromeConfigInterface,
    'topFadeHeight' | 'bottomFadeHeight' | 'headerBackdropHeight'
> = {
    headerHeight: 64,
    intensity: 50,
    maxBlurIntensity: 52,
    collapseStart: 0,
    smallTitleStart: 40,
    largeTitleEnd: 60,
    collapseEnd: 80,
    scrollEventThrottle: 16,
    snapToCollapse: false,
    colors: {
        light: { solid: 'rgba(255,255,255,0.42)', wash: 'rgba(255,255,255,0.08)' },
        dark: { solid: 'rgba(0,0,0,0.48)', wash: 'rgba(0,0,0,0.12)' },
    },
    maskStops: {
        top: {
            0: { color: 'rgba(0,0,0,0.99)' },
            0.5: { color: '#000000' },
            1: { color: 'transparent' },
        },
        bottom: {
            0: { color: 'transparent' },
            0.5: { color: '#000000' },
            1: { color: 'rgba(0,0,0,0.99)' },
        },
    },
};
