import { testIDSelector } from '../selector';

import type { ElSelectorFn } from '../type';

export const testID$: ElSelectorFn = (testID, context = browser) => context.$(testIDSelector(testID));
