import { isAndroidCapability } from './is-android.capability.js';
import { isBrowserCapability } from './is-browser.capability.js';

export const isIOSCapability = (): boolean => !isBrowserCapability() && !isAndroidCapability();
