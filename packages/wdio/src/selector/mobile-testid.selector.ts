import { isAndroidCapability } from '../capability';

import { androidTestIdSelector } from './android-testid.selector';
import { iosTestIdSelector } from './ios-testid.selector';

export const mobileTestIdSelector = (testID: string): string =>
    isAndroidCapability() ? androidTestIdSelector(testID) : iosTestIdSelector(testID);
