import { browser } from '@wdio/globals';

/**
 * Whether the current WebdriverIO session drives a web browser, judged by a non-empty `browserName` capability.
 *
 * @see https://github.com/rnw-community/rnw-community/blob/master/packages/wdio/readme.md#wdio-commands-and-utils
 */
export const isBrowserCapability = (): boolean =>
    'browserName' in browser.capabilities && browser.capabilities.browserName !== '';
