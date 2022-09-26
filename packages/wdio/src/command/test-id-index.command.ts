import { testID$$ } from './test-ids.command';

import type { ElsIndexSelectorFn } from '../type';
import type { ChainablePromiseElement } from 'webdriverio';

export const testID$$Index: ElsIndexSelectorFn = async (testID, index, context = browser) => {
    const elements = await testID$$(testID, context);

    if (index >= elements.length || index < 0) {
        throw new Error(`Cannot get item by testID "${testID}" with index "${index}"`);
    }

    // eslint-disable-next-line @typescript-eslint/return-await
    return elements[index] as unknown as ChainablePromiseElement<WebdriverIO.Element>;
};
