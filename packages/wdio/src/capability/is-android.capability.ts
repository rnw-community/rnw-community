import { browser } from '@wdio/globals';

/**
 * Whether the current WebdriverIO session drives an Android device.
 *
 * @see https://github.com/rnw-community/rnw-community/blob/master/packages/wdio/readme.md#wdio-commands-and-utils
 */
export const isAndroidCapability = (): boolean => browser.isAndroid;
