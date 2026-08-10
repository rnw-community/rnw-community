import type { ScreenChromeConfigInterface } from './screen-chrome-config.interface';
import type { ColorSchemeEnum } from '../enum/color-scheme.enum';
import type { ScrollView } from 'react-native';
import type { AnimatedRef, ScrollHandlerProcessed, SharedValue } from 'react-native-reanimated';

/**
 * Provides shared scroll state, scroll wiring, color scheme, and resolved configuration to screen chrome components.
 * @see https://github.com/rnw-community/rnw-community/tree/master/packages/react-native-screen-chrome#screenchromecontextvalueinterface
 */
export interface ScreenChromeContextValueInterface {
    readonly colorScheme: ColorSchemeEnum;
    readonly config: ScreenChromeConfigInterface;
    readonly scrollY: SharedValue<number>;
    readonly scrollHandler: ScrollHandlerProcessed;
    readonly scrollRef: AnimatedRef<ScrollView>;
}
