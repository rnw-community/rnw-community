// eslint-disable-next-line max-classes-per-file
import { mockDefault$Config, mockDefaultConfig, mockElement } from '../../element.mock';
import { getExtendedRootedComponent } from '../get-extended-rooted-component/get-extended-rooted-component';

import { get$RootedComponent } from './get$-rooted-component';

enum RootedSelectorsEnum {
    Button = 'Selectors.Button',
    Root = 'Selectors.Root',
}
enum ExtendedRootedSelectorsEnum {
    ExtendedButton = 'Selectors.Button',
    Root = 'Selectors.Root',
}

class CustomRootedComponent extends get$RootedComponent(RootedSelectorsEnum) {}
class ExtendedRootedComponent extends getExtendedRootedComponent(ExtendedRootedSelectorsEnum, CustomRootedComponent) {}

describe('get$RootedComponent', () => {
    it('should get RootedComponent instance with selectors and $* selector functions', async () => {
        expect.assertions(3);

        const component = new CustomRootedComponent();

        await expect(component.Button.el()).resolves.toMatchObject(mockElement);
        await expect(component.Button.els()).resolves.toMatchObject([mockElement]);
        await expect(component.Button.byIdx(1)).resolves.toMatchObject(mockElement);
    });

    it('should use different selector configs for parent and child component', async () => {
        expect.assertions(6);

        const component = new ExtendedRootedComponent();

        await expect(component.Button.el()).resolves.toMatchObject(mockElement);
        expect(mockDefault$Config.elSelectorFn).toHaveBeenNthCalledWith(1, RootedSelectorsEnum.Root);
        expect(mockDefault$Config.elSelectorFn).toHaveBeenNthCalledWith(
            2,
            RootedSelectorsEnum.Button,
            expect.objectContaining({})
        );

        await expect(component.ExtendedButton.el()).resolves.toMatchObject(mockElement);
        expect(mockDefaultConfig.elSelectorFn).toHaveBeenNthCalledWith(1, ExtendedRootedSelectorsEnum.Root);
        expect(mockDefaultConfig.elSelectorFn).toHaveBeenNthCalledWith(
            2,
            ExtendedRootedSelectorsEnum.ExtendedButton,
            expect.objectContaining({})
        );
    });
});
