import type { ScreenChromeColorScheme } from '@rnw-community/react-native-screen-chrome';

export interface PlaygroundConfigInterface {
    readonly topHeight: number;
    readonly bottomHeight: number;
    readonly topChrome: number;
    readonly bottomChrome: number;
    readonly intensity: number;
    readonly maxBlurIntensity: number;
    readonly alphas: Readonly<Record<ScreenChromeColorScheme, { readonly solid: number; readonly wash: number }>>;
}
