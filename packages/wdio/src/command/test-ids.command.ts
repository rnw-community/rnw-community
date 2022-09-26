import { testIDSelector } from '../selector';

import type { ElsSelectorFn } from '../type';

export const testID$$: ElsSelectorFn = async (testID, context = browser) => await context.$$(testIDSelector(testID));
