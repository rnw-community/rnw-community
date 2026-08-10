import { isAndroid, isIOS, isMobile, isWeb } from '../platform/platform';

import type { CSSProperties } from 'react';
import type { ImageStyle, TextStyle, ViewStyle } from 'react-native';

type StyleType = ImageStyle | Record<string, unknown> | TextStyle | ViewStyle;

// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
const platformStyles = <T extends object = CSSProperties | StyleType, R = StyleType>(
    isPlatform: boolean,
    style: T
): R | object => (isPlatform ? style : {});

export const webStyles = <T extends object = CSSProperties | StyleType>(style: T): StyleType =>
    platformStyles<T>(isWeb, style);

export const mobileStyles = <T extends object>(style: T): StyleType => platformStyles<T>(isMobile, style);

export const iosStyles = <T extends object>(style: T): StyleType => platformStyles<T>(isIOS, style);

export const androidStyles = <T extends object>(style: T): StyleType => platformStyles<T>(isAndroid, style);
