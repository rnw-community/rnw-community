import { testIDSelector } from '../selector';

import type { ElsSelectorFn } from '../type';

export const testID$$: ElsSelectorFn = (testID, context = browser) => context.$$(testIDSelector(testID));
