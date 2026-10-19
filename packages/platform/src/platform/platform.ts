import { Platform } from 'react-native';

/**
 * Whether the app runs on the web platform.
 *
 * @see https://github.com/rnw-community/rnw-community/blob/master/packages/platform/readme.md#platform-constants
 */
export const isWeb = Platform.OS === 'web';
/**
 * Whether the app runs on iOS.
 *
 * @see https://github.com/rnw-community/rnw-community/blob/master/packages/platform/readme.md#platform-constants
 */
export const isIOS = Platform.OS === 'ios';
/**
 * Whether the app runs on Android.
 *
 * @see https://github.com/rnw-community/rnw-community/blob/master/packages/platform/readme.md#platform-constants
 */
export const isAndroid = Platform.OS === 'android';
/**
 * Whether the app runs on iOS or Android.
 *
 * @see https://github.com/rnw-community/rnw-community/blob/master/packages/platform/readme.md#platform-constants
 */
export const isMobile = isAndroid || isIOS;
