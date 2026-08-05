import { describe, expect, it } from '@jest/globals';

import { mockDefault$Config, mockElement } from '../../element.mock.js';
import { ExtendedComponent$Mock } from '../mocks/extended-component$.mock.js';
import { ParentComponent$SelectorsMock } from '../mocks/parent-component$-selectors.mock.js';

describe('getExtendedComponent$', () => {
    it('should use extended parent component$ testID selector functions', async () => {
         
        expect.assertions(6);

        const component = new ExtendedComponent$Mock();

        await expect(component.CSSSelector.el()).resolves.toStrictEqual(mockElement);
        expect(mockDefault$Config.elSelectorFn).toHaveBeenNthCalledWith(1, ParentComponent$SelectorsMock.CSSSelector);

        await expect(component.CSSSelector.els()).resolves.toStrictEqual([mockElement]);
        expect(mockDefault$Config.elsSelectorFn).toHaveBeenNthCalledWith(1, ParentComponent$SelectorsMock.CSSSelector);

        await expect(component.CSSSelector.byIdx(1)).resolves.toStrictEqual(mockElement);
        expect(mockDefault$Config.elsSelectorFn).toHaveBeenNthCalledWith(1, ParentComponent$SelectorsMock.CSSSelector);
    });
});
