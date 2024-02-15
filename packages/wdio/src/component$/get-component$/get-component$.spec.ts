import { describe, expect, it } from '@jest/globals';

import { mockDefault$Config, mockElement } from '../../element.mock';
import { Component$SelectorsMock } from '../mocks/component$-selectors.mock';
import { Component$Mock } from '../mocks/component$.mock';
import { ParentComponent$Mock } from '../mocks/parent-component$.mock';

const assert$ComponentMethods = async (component: Component$Mock): Promise<void> => {
    await expect(component.Button$.el()).resolves.toStrictEqual(mockElement);
    expect(mockDefault$Config.elSelectorFn).toHaveBeenNthCalledWith(1, Component$SelectorsMock.Button$);

    await expect(component.Button$.els()).resolves.toStrictEqual([mockElement]);
    expect(mockDefault$Config.elsSelectorFn).toHaveBeenNthCalledWith(1, Component$SelectorsMock.Button$);

    await expect(component.Button$.byIdx(1)).resolves.toStrictEqual(mockElement);
    expect(mockDefault$Config.elsSelectorFn).toHaveBeenNthCalledWith(1, Component$SelectorsMock.Button$);
};

describe('getComponent$', () => {
    it('should get Component$ instance with selectors and $* selector functions', async () => {
        expect.assertions(6);

        await assert$ComponentMethods(new Component$Mock());
    });

    it('should use extended parent component$ testID selector functions', async () => {
        // eslint-disable-next-line no-magic-numbers
        expect.assertions(6);

        const component = new ParentComponent$Mock();

        await assert$ComponentMethods(component);
    });
});
