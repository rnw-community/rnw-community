import { browser } from '@wdio/globals';

import type { ElSelectorFn } from '../type/index.js';

export const el$: ElSelectorFn = (selector, context = browser) => context.$(selector);
