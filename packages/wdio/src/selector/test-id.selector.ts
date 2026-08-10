import { isBrowserCapability } from '../capability';

import { mobileTestIDSelector } from './mobile-testid.selector';
import { webTestIDSelector } from './web-testid.selector';

export const testIDSelector = (testID: string): string =>
    isBrowserCapability() ? webTestIDSelector(testID) : mobileTestIDSelector(testID);
