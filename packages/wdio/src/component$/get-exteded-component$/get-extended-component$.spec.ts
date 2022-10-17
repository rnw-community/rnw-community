import { mockDefault$Config, mockElement } from '../../element.mock';
import { ExtendedComponent$Mock } from '../mocks/extended-component$.mock';
import { ParentComponent$SelectorsMock } from '../mocks/parent-component$-selectors.mock';

describe('getExtendedComponent$', () => {
    it('should use extended parent component$ testID selector functions', async () => {
        // eslint-disable-next-line no-magic-numbers
        expect.assertions(6);

        const component = new ExtendedComponent$Mock();

        await expect(component.CSSSelector.el()).resolves.toMatchObject(mockElement);
        expect(mockDefault$Config.elSelectorFn).toHaveBeenNthCalledWith(1, ParentComponent$SelectorsMock.CSSSelector);

        await expect(component.CSSSelector.els()).resolves.toMatchObject([mockElement]);
        expect(mockDefault$Config.elsSelectorFn).toHaveBeenNthCalledWith(1, ParentComponent$SelectorsMock.CSSSelector);

        await expect(component.CSSSelector.byIdx(1)).resolves.toMatchObject(mockElement);
        expect(mockDefault$Config.elsSelectorFn).toHaveBeenNthCalledWith(1, ParentComponent$SelectorsMock.CSSSelector);
    });
});
