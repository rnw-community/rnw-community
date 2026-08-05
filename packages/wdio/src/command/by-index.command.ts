import { browser } from '@wdio/globals';

import type { ElsIndexSelectorFn } from '../type/index.js';

export const byIndex$$: ElsIndexSelectorFn = (selector, index, context = browser) => context.$$(selector)[index];
