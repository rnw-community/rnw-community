import { isNotEmptyString } from '@rnw-community/shared';

import { testIDSelector } from '../selector';

import type { ElsSelectorFn } from '../type';

export const testID$$: ElsSelectorFn = (testID, context = browser) =>
    context.$$(isNotEmptyString(testID) ? testIDSelector(testID) : testID);
