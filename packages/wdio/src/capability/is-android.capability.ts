import { browser } from '@wdio/globals';

export const isAndroidCapability = (): boolean => browser.isAndroid;
