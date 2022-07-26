import { isAndroidCapability } from './is-android.capability';
import { isBrowserCapability } from './is-browser.capability';

export const isIOSCapability = (): boolean => !isBrowserCapability() && !isAndroidCapability();
