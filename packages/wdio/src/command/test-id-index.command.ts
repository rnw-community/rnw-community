import { browser } from '@wdio/globals';

import { testIDSelector } from '../selector';

import type { ElsIndexSelectorFn } from '../type';

/**
 * Finds the element at `index` among all elements matching a testID within the context.
 *
 * @see https://github.com/rnw-community/rnw-community/blob/master/packages/wdio/readme.md#testidindex
 */
export const testID$$Index: ElsIndexSelectorFn = (testID, index, context = browser) =>
    context.$$(testIDSelector(testID))[index];
