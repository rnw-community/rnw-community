import type { ScreenChromeConfigInterface } from './screen-chrome-config.interface';
import type { EdgeFadeBandRenderer } from '../edge-fade/edge-fade-band-renderer.type';
import type { ScreenChromeColorScheme } from '../type/screen-chrome-color-scheme.type';
import type { SharedValue } from 'react-native-reanimated';

/**
 * Provides the color scheme and resolved configuration to screen chrome components.
 * @see https://github.com/rnw-community/rnw-community/tree/master/packages/react-native-screen-chrome#screenchromecontextvalueinterface
 */
export interface ScreenChromeContextValueInterface {
    /** Active color scheme selecting the configured color set. */
    readonly colorScheme: ScreenChromeColorScheme;
    /** Validated configuration merged from defaults and caller overrides. */
    readonly config: ScreenChromeConfigInterface;
    /** App-wide band renderer every `EdgeFade` without its own `renderBand` uses. */
    readonly renderEdgeFadeBand?: EdgeFadeBandRenderer;
    /** App-owned scroll offset passed as the provider's `scrollY`; absent when the provider owns the scroll. */
    readonly externalScrollY?: SharedValue<number>;
}
