import { mockDefault$Config, mockDefaultConfig, mockElement } from '../../element.mock';
import { RootedComponent$Mock } from '../mocks/rooted-component$.mock';
import { RootedComponentSelectorsMock } from '../mocks/rooted-component-selectors.mock';
import { RootedExtendedComponent$Mock } from '../mocks/rooted-extended-component$.mock';
import { RootedParentComponentSelectorsMock } from '../mocks/rooted-parent-component-selectors.mock';

describe('get$RootedComponent', () => {
    it('should get RootedComponent instance with selectors and $* selector functions', async () => {
        expect.assertions(5);

        const component = new RootedComponent$Mock();

        await expect(component.Button.el()).resolves.toMatchObject(mockElement);
        expect(mockDefault$Config.elSelectorFn).toHaveBeenNthCalledWith(1, RootedComponentSelectorsMock.Root);
        expect(mockDefault$Config.elSelectorFn).toHaveBeenNthCalledWith(
            2,
            RootedComponentSelectorsMock.Button,
            expect.objectContaining({})
        );

        await expect(component.Button.els()).resolves.toMatchObject([mockElement]);
        await expect(component.Button.byIdx(1)).resolves.toMatchObject(mockElement);

        jest.clearAllMocks();
    });

    it('should use different selector configs for parent and child component', async () => {
        expect.assertions(6);

        const component = new RootedExtendedComponent$Mock();

        await expect(component.Button.el()).resolves.toMatchObject(mockElement);
        expect(mockDefault$Config.elSelectorFn).toHaveBeenNthCalledWith(1, RootedParentComponentSelectorsMock.ParentRoot);
        expect(mockDefault$Config.elSelectorFn).toHaveBeenNthCalledWith(
            2,
            RootedComponentSelectorsMock.Button,
            expect.objectContaining({})
        );

        await expect(component.ParentButton.el()).resolves.toMatchObject(mockElement);
        expect(mockDefaultConfig.elSelectorFn).toHaveBeenNthCalledWith(1, RootedParentComponentSelectorsMock.ParentRoot);
        expect(mockDefaultConfig.elSelectorFn).toHaveBeenNthCalledWith(
            2,
            RootedParentComponentSelectorsMock.ParentButton,
            expect.objectContaining({})
        );
    });
});
