import type { ElsIndexSelectorFn } from '../type';
import type { ChainablePromiseElement } from 'webdriverio';

export const byIndex$$: ElsIndexSelectorFn = (testID, index, context = browser) =>
    context.$$(testID).then(elements => {
        if (index >= elements.length || index < 0) {
            throw new Error(`Cannot get item by testID "${testID}" with index "${index}"`);
        }

        return $(elements[index]);
    }) as ChainablePromiseElement<WebdriverIO.Element>;
