import { testID$$ } from './test-ids.command';

import type { ElsIndexSelectorFn } from '../type';
import type { ChainablePromiseElement } from 'webdriverio';

export const testID$$Index: ElsIndexSelectorFn = (testID, index, context = browser) =>
    testID$$(testID, context).then(elements => {
        if (index >= elements.length || index < 0) {
            throw new Error(`Cannot get item by testID "${testID}" with index "${index}"`);
        }

        return elements[index];
    }) as ChainablePromiseElement<WebdriverIO.Element>;
