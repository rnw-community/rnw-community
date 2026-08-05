import { isAndroidCapability } from '../capability/index.js';

import { androidTestIDSelector } from './android-testid.selector.js';
import { iosTestIDSelector } from './ios-testid.selector.js';

export const mobileTestIDSelector = (testID: string): string =>
    isAndroidCapability() ? androidTestIDSelector(testID) : iosTestIDSelector(testID);
