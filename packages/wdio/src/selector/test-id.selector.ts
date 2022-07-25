import { isBrowserCapability } from '../capability';

import { mobileTestIdSelector } from './mobile-testid.selector';
import { webTestIdSelector } from './web-testid.selector';

export const testIdSelector = (testID: string): string =>
    isBrowserCapability() ? webTestIdSelector(testID) : mobileTestIdSelector(testID);
