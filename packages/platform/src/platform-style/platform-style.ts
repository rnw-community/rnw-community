import { isAndroid, isIOS, isMobile, isWeb } from '../platform/platform';

import type { CSSProperties } from 'react';
import type { ImageStyle, TextStyle, ViewStyle } from 'react-native';

type StyleType = ImageStyle | Record<string, unknown> | TextStyle | ViewStyle;

// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
const platformStyles = <T extends object = CSSProperties | StyleType, R = StyleType>(
    isPlatform: boolean,
    style: T
): R | object => (isPlatform ? style : {});

/**
 * Returns `style` on web and an empty object on every other platform, for spreading web-only styles.
 *
 * @see https://github.com/rnw-community/rnw-community/blob/master/packages/platform/readme.md#platform-styling
 */
export const webStyles = <T extends object = CSSProperties | StyleType>(style: T): StyleType =>
    platformStyles<T>(isWeb, style);

/**
 * Returns `style` on iOS and Android and an empty object on every other platform, for spreading mobile-only styles.
 *
 * @see https://github.com/rnw-community/rnw-community/blob/master/packages/platform/readme.md#platform-styling
 */
export const mobileStyles = <T extends object>(style: T): StyleType => platformStyles<T>(isMobile, style);

/**
 * Returns `style` on iOS and an empty object on every other platform, for spreading iOS-only styles.
 *
 * @see https://github.com/rnw-community/rnw-community/blob/master/packages/platform/readme.md#platform-styling
 */
export const iosStyles = <T extends object>(style: T): StyleType => platformStyles<T>(isIOS, style);

/**
 * Returns `style` on Android and an empty object on every other platform, for spreading Android-only styles.
 *
 * @see https://github.com/rnw-community/rnw-community/blob/master/packages/platform/readme.md#platform-styling
 */
export const androidStyles = <T extends object>(style: T): StyleType => platformStyles<T>(isAndroid, style);
