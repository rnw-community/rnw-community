import { testID$$ } from './test-ids.command';

import type { SelectorContextType } from '../type';

export const testID$$Index = async (
    testID: string,
    index: number,
    context: SelectorContextType = browser
): Promise<WebdriverIO.Element> => {
    const elements = await testID$$(testID, context);

    if (index >= elements.length || index < 0) {
        throw new Error(`Cannot get item by testID "${testID}" with index "${index}"`);
    }

    return elements[index];
};
