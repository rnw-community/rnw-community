import type { ElsIndexSelectorFn } from '../type';

export const byIndex$$: ElsIndexSelectorFn = async (testID, index, context = browser) => {
    const elements = await context.$$(testID);

    if (index >= elements.length || index < 0) {
        throw new Error(`Cannot get item by testID "${testID}" with index "${index}"`);
    }

    return elements[index];
};
