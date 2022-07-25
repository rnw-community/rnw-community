import { testIdSelector } from '../selector';

import type { SelectorContext } from '../type';

export const testID$ = async (testID: string, context: SelectorContext = browser): Promise<WebdriverIO.Element> =>
    await context.$(testIdSelector(testID));
