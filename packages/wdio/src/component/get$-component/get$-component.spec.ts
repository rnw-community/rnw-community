import { mockDefault$Config, mockDefaultConfig, mockElement } from '../../element.mock';
import { Component$Mock } from '../mocks/component$.mock';
import { ComponentSelectorsMock } from '../mocks/component-selectors.mock';
import { ExtendedComponent$Mock } from '../mocks/parent-component$.mock';
import { ParentComponentSelectorsMock } from '../mocks/parent-component-selectors.mock';

const assert$ComponentMethods = async (component: Component$Mock): Promise<void> => {
    await expect(component.Button.el()).resolves.toMatchObject(mockElement);
    expect(mockDefault$Config.elSelectorFn).toHaveBeenNthCalledWith(1, ComponentSelectorsMock.Button);

    await expect(component.Button.els()).resolves.toMatchObject([mockElement]);
    expect(mockDefault$Config.elsSelectorFn).toHaveBeenNthCalledWith(1, ComponentSelectorsMock.Button);

    await expect(component.Button.byIdx(1)).resolves.toMatchObject(mockElement);
    expect(mockDefault$Config.elsIndexSelectorFn).toHaveBeenNthCalledWith(1, ComponentSelectorsMock.Button, 1);
};

describe('get$Component', () => {
    it('should get Component instance with selectors and $* selector functions', async () => {
        expect.assertions(6);

        await assert$ComponentMethods(new Component$Mock());
    });

    it('should use extended parent component testID selector functions', async () => {
        // eslint-disable-next-line no-magic-numbers
        expect.assertions(12);

        const component = new ExtendedComponent$Mock();

        await assert$ComponentMethods(component);

        await expect(component.ParentButton.el()).resolves.toMatchObject(mockElement);
        expect(mockDefaultConfig.elSelectorFn).toHaveBeenNthCalledWith(1, ParentComponentSelectorsMock.ParentButton);

        await expect(component.ParentButton.els()).resolves.toMatchObject([mockElement]);
        expect(mockDefaultConfig.elsSelectorFn).toHaveBeenNthCalledWith(1, ParentComponentSelectorsMock.ParentButton);

        await expect(component.ParentButton.byIdx(1)).resolves.toMatchObject(mockElement);
        expect(mockDefaultConfig.elsIndexSelectorFn).toHaveBeenNthCalledWith(
            1,
            ParentComponentSelectorsMock.ParentButton,
            1
        );
    });
});
