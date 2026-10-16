import { browser } from '@wdio/globals';

import type { ElsIndexSelectorFn } from '../type';

/**
 * Finds the element at `index` among all matches of a raw WebdriverIO selector within the context.
 *
 * @see https://github.com/rnw-community/rnw-community/blob/master/packages/wdio/readme.md#components
 */
export const byIndex$$: ElsIndexSelectorFn = (selector, index, context = browser) => context.$$(selector)[index];
