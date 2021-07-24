/* eslint-disable @typescript-eslint/ban-types */
import { isAndroid, isIOS, isMobile, isWeb } from '../platform/platform';

import type { CSSProperties } from 'react';
import type { ImageStyle, TextStyle, ViewStyle } from 'react-native';

type StyleType = ImageStyle | Record<string, unknown> | TextStyle | ViewStyle;

const platformStyles = <T extends object = CSSProperties | StyleType, R = StyleType>(
    isPlatform: boolean,
    style: T
): R | {} => (isPlatform ? style : {});

/**
 * Return style object if current build platform is WEB
 *
 * @param style Styling object
 * @returns Style object if current build platform is WEB otherwise {}
 */
export const webStyles = <T extends object = CSSProperties | StyleType>(style: T): StyleType =>
    platformStyles<T>(isWeb, style);

/**
 * Return style object if current build platform is Android or IOS
 *
 * @param style Styling object
 * @returns Style object if current build platform is Android or IOS otherwise {}
 */
export const mobileStyles = <T extends object>(style: T): StyleType => platformStyles<T>(isMobile, style);

/**
 * Return style object if current build platform is IOS
 *
 * @param style Styling object
 * @returns Style object if current build platform is IOS otherwise {}
 */
export const iosStyles = <T extends object>(style: T): StyleType => platformStyles<T>(isIOS, style);

/**
 * Return style object if current build platform is Android
 *
 * @param style Styling object
 * @returns Style object if current build platform is Android otherwise {}
 */
export const androidStyles = <T extends object>(style: T): StyleType => platformStyles<T>(isAndroid, style);
