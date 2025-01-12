import { browser } from '@wdio/globals';

import { testIDSelector } from '../selector';

import type { ElsIndexSelectorFn } from '../type';

export const testID$$Index: ElsIndexSelectorFn = (testID, index, context = browser) =>
    context.$$(testIDSelector(testID))[index];
