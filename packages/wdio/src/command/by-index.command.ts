import { browser } from '@wdio/globals';

import type { ElsIndexSelectorFn } from '../type';

export const byIndex$$: ElsIndexSelectorFn = (selector, index, context = browser) => context.$$(selector)[index];
