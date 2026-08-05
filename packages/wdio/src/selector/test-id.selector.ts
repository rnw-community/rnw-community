import { isBrowserCapability } from '../capability/index.js';

import { mobileTestIDSelector } from './mobile-testid.selector.js';
import { webTestIDSelector } from './web-testid.selector.js';

export const testIDSelector = (testID: string): string =>
    isBrowserCapability() ? webTestIDSelector(testID) : mobileTestIDSelector(testID);
