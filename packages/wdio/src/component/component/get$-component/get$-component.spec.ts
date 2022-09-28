// eslint-disable-next-line max-classes-per-file
import { mockDefault$Config, mockDefaultConfig, mockElement } from '../../element.mock';
import { getExtendedComponent } from '../get-exteded-component/get-extended-component';

import { get$Component } from './get$-component';

enum SelectorsEnum {
    Button = 'Selectors.Button',
}
enum ExtendedSelectorsEnum {
    ExtendedButton = 'Selectors.ExtendedButton',
}

class CustomComponent extends get$Component(SelectorsEnum) {}
class CustomExtendedComponent extends getExtendedComponent(ExtendedSelectorsEnum, CustomComponent) {}

const assert$ComponentMethods = async (component: CustomComponent): Promise<void> => {
    await expect(component.Button.el()).resolves.toMatchObject(mockElement);
    expect(mockDefault$Config.elSelectorFn).toHaveBeenNthCalledWith(1, SelectorsEnum.Button);

    await expect(component.Button.els()).resolves.toMatchObject([mockElement]);
    expect(mockDefault$Config.elsSelectorFn).toHaveBeenNthCalledWith(1, SelectorsEnum.Button);

    await expect(component.Button.byIdx(1)).resolves.toMatchObject(mockElement);
    expect(mockDefault$Config.elsIndexSelectorFn).toHaveBeenNthCalledWith(1, SelectorsEnum.Button, 1);
};

describe('get$Component', () => {
    it('should get Component instance with selectors and $* selector functions', async () => {
        expect.assertions(6);

        await assert$ComponentMethods(new CustomComponent());
    });

    it('should use extended parent component testID selector functions', async () => {
        // eslint-disable-next-line no-magic-numbers
        expect.assertions(12);

        const component = new CustomExtendedComponent();

        await assert$ComponentMethods(component);

        await expect(component.ExtendedButton.el()).resolves.toMatchObject(mockElement);
        expect(mockDefaultConfig.elSelectorFn).toHaveBeenNthCalledWith(1, ExtendedSelectorsEnum.ExtendedButton);

        await expect(component.ExtendedButton.els()).resolves.toMatchObject([mockElement]);
        expect(mockDefaultConfig.elsSelectorFn).toHaveBeenNthCalledWith(1, ExtendedSelectorsEnum.ExtendedButton);

        await expect(component.ExtendedButton.byIdx(1)).resolves.toMatchObject(mockElement);
        expect(mockDefaultConfig.elsIndexSelectorFn).toHaveBeenNthCalledWith(1, ExtendedSelectorsEnum.ExtendedButton, 1);
    });
});
