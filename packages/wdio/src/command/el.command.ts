import { browser } from '@wdio/globals';

import type { ElSelectorFn } from '../type';

export const el$: ElSelectorFn = (selector, context = browser) => context.$(selector);
