import { testID$$ } from './test-ids.command';

import type { ElsIndexSelectorFn } from '../type';

export const testID$$Index: ElsIndexSelectorFn = async (testID, index, context = browser) => {
    const elements = await testID$$(testID, context);

    if (index >= elements.length || index < 0) {
        throw new Error(`Cannot get item by testID "${testID}" with index "${index}"`);
    }

    return elements[index];
};
