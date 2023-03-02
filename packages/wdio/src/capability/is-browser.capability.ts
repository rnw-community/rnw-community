import { browser } from '@wdio/globals';

export const isBrowserCapability = (): boolean =>
    'browserName' in browser.capabilities && browser.capabilities.browserName !== '';
