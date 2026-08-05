import { browser } from '@wdio/globals';

import { isNotEmptyString } from '@rnw-community/shared';

import { testIDSelector } from '../selector/index.js';

import type { ElsSelectorFn } from '../type/index.js';

export const testID$$: ElsSelectorFn = (testID, context = browser) =>
    context.$$(isNotEmptyString(testID) ? testIDSelector(testID) : testID);
