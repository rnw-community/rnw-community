import type { ScreenChromeColorScheme } from '@rnw-community/react-native-screen-chrome';

export interface PlaygroundTogglesInterface {
    readonly scheme: ScreenChromeColorScheme;
    readonly isWashOn: boolean;
    readonly isBlurOn: boolean;
    readonly isChromeOn: boolean;
    readonly isScrolled: boolean;
    readonly isPanelOpen: boolean;
}
