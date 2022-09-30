import type { ElsSelectorFn } from '../type';

export const els$: ElsSelectorFn = (selector, context = browser) => context.$$(selector);
