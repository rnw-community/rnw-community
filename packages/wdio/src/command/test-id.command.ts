import { testIDSelector } from '../selector';

import type { ElSelectorFn } from '../type';
import type { ChainablePromiseElement } from 'webdriverio';

export const testID$: ElSelectorFn = (testID, context = browser) =>
    context.$(testIDSelector(testID)) as unknown as ChainablePromiseElement<WebdriverIO.Element>;
