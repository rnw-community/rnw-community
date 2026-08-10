import { isAndroidCapability } from '../capability';

import { androidTestIDSelector } from './android-testid.selector';
import { iosTestIDSelector } from './ios-testid.selector';

export const mobileTestIDSelector = (testID: string): string =>
    isAndroidCapability() ? androidTestIDSelector(testID) : iosTestIDSelector(testID);
