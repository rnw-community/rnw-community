import { browser } from '@wdio/globals';

import { testIDSelector } from '../selector/index.js';

import type { ElsIndexSelectorFn } from '../type/index.js';

export const testID$$Index: ElsIndexSelectorFn = (testID, index, context = browser) =>
    context.$$(testIDSelector(testID))[index];
