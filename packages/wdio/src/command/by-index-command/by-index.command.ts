import { wdioElementChainByRef } from '../../util';

import type { ElsIndexSelectorFn } from '../../type';
import type { ChainablePromiseElement } from 'webdriverio';

export const byIndex$$: ElsIndexSelectorFn = (selector, index, context = browser) =>
    context.$$(selector).then(elements => {
        if (index >= elements.length || index < 0) {
            throw new Error(`Cannot get item by $$ "${selector}" with index "${index}"`);
        }

        return wdioElementChainByRef(elements[index]);
    }) as ChainablePromiseElement<WebdriverIO.Element>;
