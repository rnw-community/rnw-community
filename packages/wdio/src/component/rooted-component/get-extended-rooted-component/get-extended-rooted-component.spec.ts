// eslint-disable-next-line max-classes-per-file
import { mockDefaultConfig } from '../../element.mock';
import { RootedComponentSelectorsMock } from '../../mocks/rooted-component-selectors.mock';
import { RootedComponentMock } from '../../mocks/rooted-component.mock';
import { RootedParentComponentSelectorsMock } from '../../mocks/rooted-parent-component-selectors.mock';
import { RootedComponent } from '../rooted-component';

import { getExtendedRootedComponent } from './get-extended-rooted-component';

enum ParentRootedSelectorsEnum {
    ParentButton = 'ParentRootedSelectorsEnum.ParentButton',
    Root = 'ParentRootedSelectorsEnum.Root',
}

enum RootedSelectorsEnum {
    Button = 'RootedSelectorsEnum.Button',
    Root = 'RootedSelectorsEnum.Root',
}

class ParentRootedComponent extends getExtendedRootedComponent(ParentRootedSelectorsEnum, RootedComponent) {}
class CustomRootedComponent extends getExtendedRootedComponent(RootedSelectorsEnum, ParentRootedComponent) {}

describe('getExtendedRootedComponent', () => {
    it('should call parent RootedComponent methods', async () => {
        expect.assertions(5);

        const component = new CustomRootedComponent();

        await component.RootEl;
        expect(mockDefaultConfig.elSelectorFn).toHaveBeenNthCalledWith(1, RootedSelectorsEnum.Root);

        await component.Button.el();
        expect(mockDefaultConfig.elSelectorFn).toHaveBeenNthCalledWith(2, RootedSelectorsEnum.Root);
        expect(mockDefaultConfig.elSelectorFn).toHaveBeenNthCalledWith(
            3,
            RootedSelectorsEnum.Button,
            expect.objectContaining({})
        );

        await component.ParentButton.el();
        expect(mockDefaultConfig.elSelectorFn).toHaveBeenNthCalledWith(4, RootedSelectorsEnum.Root);
        expect(mockDefaultConfig.elSelectorFn).toHaveBeenNthCalledWith(
            5,
            ParentRootedSelectorsEnum.ParentButton,
            expect.objectContaining({})
        );
    });

    it('should use correct "latest" root selector from overloaded constructor in all parents chain', async () => {
        expect.assertions(2);

        const component = new RootedComponentMock();

        await component.RootEl;
        expect(mockDefaultConfig.elSelectorFn).toHaveBeenCalledWith(RootedComponentSelectorsMock.CustomRoot);

        await component.ParentButton.el();
        expect(mockDefaultConfig.elSelectorFn).toHaveBeenCalledWith(
            RootedParentComponentSelectorsMock.ParentButton,
            expect.objectContaining({})
        );
    });
});
