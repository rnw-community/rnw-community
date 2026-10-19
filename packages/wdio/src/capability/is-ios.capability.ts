import { isAndroidCapability } from './is-android.capability';
import { isBrowserCapability } from './is-browser.capability';

/**
 * Whether the current WebdriverIO session drives an iOS device, i.e. neither a browser nor Android.
 *
 * @see https://github.com/rnw-community/rnw-community/blob/master/packages/wdio/readme.md#wdio-commands-and-utils
 */
export const isIOSCapability = (): boolean => !isBrowserCapability() && !isAndroidCapability();
