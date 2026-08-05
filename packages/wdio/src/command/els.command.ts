import { browser } from '@wdio/globals';

import type { ElsSelectorFn } from '../type/index.js';

export const els$: ElsSelectorFn = (selector, context = browser) => context.$$(selector);
