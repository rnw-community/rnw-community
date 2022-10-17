import { isNotEmptyString } from '@rnw-community/shared';

import { testIDSelector } from '../selector';

import type { ElSelectorFn } from '../type';

export const testID$: ElSelectorFn = (testID, context = browser) =>
    context.$(isNotEmptyString(testID) ? testIDSelector(testID) : testID);
