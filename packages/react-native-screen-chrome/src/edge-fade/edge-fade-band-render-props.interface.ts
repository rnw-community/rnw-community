import type { EdgeFadePosition } from './edge-fade-position.type';
import type { ScreenChromeColorScheme } from '../type/screen-chrome-color-scheme.type';
import type { BlurTint } from 'expo-blur';
import type { ReactNode } from 'react';

/**
 * Describes the resolved band visuals an `EdgeFadeBandRenderer` receives to draw custom edge-fade band content.
 * @see https://github.com/rnw-community/rnw-community/tree/master/packages/react-native-screen-chrome#edgefadebandrenderpropsinterface
 */
export interface EdgeFadeBandRenderPropsInterface {
    /** Screen edge the band renders at. */
    readonly position: EdgeFadePosition;
    /** Active color scheme of the surrounding provider. */
    readonly colorScheme: ScreenChromeColorScheme;
    /** Resolved band height in points, safe-area inset included. */
    readonly height: number;
    /** Expo Blur tint the default band uses for the active color scheme. */
    readonly tint: BlurTint;
    /** Wash gradient colors from the top of the band to its bottom, solid at the screen edge. */
    readonly washColors: readonly [string, string];
    /** Mask gradient colors resolved from the provider config's `maskStops` for this position, sorted by offset. */
    readonly maskColors: readonly [string, string, ...string[]];
    /** Mask gradient locations matching `maskColors`, each between 0 and 1. */
    readonly maskLocations: readonly [number, number, ...number[]];
    /** The package's blur element, filling the band, with its static or scroll-driven intensity already applied. */
    readonly blur: ReactNode;
    /** The package's complete default band content, for renderers that wrap or conditionally fall back to it. */
    readonly defaultBand: ReactNode;
}
