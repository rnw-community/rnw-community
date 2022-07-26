import { testIDSelector } from '../selector';

import type { SelectorContextType } from '../type';

export const testID$$ = async (testID: string, context: SelectorContextType = browser): Promise<WebdriverIO.ElementArray> =>
    await context.$$(testIDSelector(testID));