import { isAndroidCapability } from '../capability';

import { androidTestIDSelector } from './android-testid.selector';
import { iosTestIDSelector } from './ios-testid.selector';

/**
 * Builds the Android or iOS testID selector for the current session's platform.
 *
 * @see https://github.com/rnw-community/rnw-community/blob/master/packages/wdio/readme.md#wdio-commands-and-utils
 */
export const mobileTestIDSelector = (testID: string): string =>
    isAndroidCapability() ? androidTestIDSelector(testID) : iosTestIDSelector(testID);
