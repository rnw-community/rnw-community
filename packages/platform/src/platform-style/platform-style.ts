import { CSSProperties } from 'react';
import { ImageStyle, TextStyle, ViewStyle } from 'react-native';

import { isAndroid, isIOS, isMobile, isWeb } from '../platform';

export type StyleType = ViewStyle | TextStyle | ImageStyle | {};

const platformStyles = <T extends object = StyleType | CSSProperties, R = StyleType>(
    isPlatform: boolean,
    style: T
): R | {} => (isPlatform ? style : {});

/**
 * Return style object if current build platform is WEB
 *
 * @param style Styling object
 * @returns Style object if current build platform is WEB otherwise {}
 */
export const webStyles = <T extends object = StyleType | CSSProperties>(style: T) => platformStyles<T>(isWeb, style);

/**
 * Return style object if current build platform is Android or IOS
 *
 * @param style Styling object
 * @returns Style object if current build platform is Android or IOS otherwise {}
 */
export const mobileStyles = <T extends object>(style: T) => platformStyles<T>(isMobile, style);

/**
 * Return style object if current build platform is IOS
 *
 * @param style Styling object
 * @returns Style object if current build platform is IOS otherwise {}
 */
export const iosStyles = <T extends object>(style: T) => platformStyles<T>(isIOS, style);

/**
 * Return style object if current build platform is Android
 *
 * @param style Styling object
 * @returns Style object if current build platform is Android otherwise {}
 */
export const androidStyles = <T extends object>(style: T) => platformStyles<T>(isAndroid, style);
