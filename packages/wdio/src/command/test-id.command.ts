import { testIDSelector } from '../selector';

import type { ElSelectorFn } from '../type';

export const testID$: ElSelectorFn = async (testID, context = browser) => await context.$(testIDSelector(testID));
