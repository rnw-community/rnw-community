import type { ElSelectorFn } from '../type';

export const el$: ElSelectorFn = (selector, context = browser) => context.$(selector);
