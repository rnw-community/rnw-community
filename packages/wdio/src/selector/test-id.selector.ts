import { isBrowserCapability } from '../capability';

import { mobileTestIDSelector } from './mobile-testid.selector';
import { webTestIDSelector } from './web-testid.selector';

/**
 * Builds the web or mobile testID selector for the current session's platform.
 *
 * @see https://github.com/rnw-community/rnw-community/blob/master/packages/wdio/readme.md#wdio-commands-and-utils
 */
export const testIDSelector = (testID: string): string =>
    isBrowserCapability() ? webTestIDSelector(testID) : mobileTestIDSelector(testID);
