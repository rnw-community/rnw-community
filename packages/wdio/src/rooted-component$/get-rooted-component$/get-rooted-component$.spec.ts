import { mockDefault$Config, mockDefaultConfig, mockElement } from '../../element.mock';
import { RootedComponentSelectorsMock } from '../../rooted-component/mocks/rooted-component-selectors.mock';
import { DefaultRootRootedComponent$Mock } from '../mocks/default-root-rooted-component$.mock';
import { RootedComponent$SelectorsMock } from '../mocks/rooted-component$-selectors.mock';
import { RootedComponent$Mock } from '../mocks/rooted-component$.mock';
import { RootedExtendedComponent$SelectorsMock } from '../mocks/rooted-extended-component$-selectors.mock';
import { RootedExtendedComponent$Mock } from '../mocks/rooted-extended-component$.mock';
import { RootedMixedComponent$Mock } from '../mocks/rooted-mixed-component$.mock';

describe('getRootedComponent$', () => {
    it('should get RootedComponent instance with selectors and $* selector functions', async () => {
        expect.assertions(5);

        const component = new RootedComponent$Mock(RootedComponent$SelectorsMock.Root$);

        await expect(component.Button$.el()).resolves.toMatchObject(mockElement);
        expect(mockDefault$Config.elSelectorFn).toHaveBeenNthCalledWith(1, RootedComponent$SelectorsMock.Root$);
        expect(mockDefault$Config.elSelectorFn).toHaveBeenNthCalledWith(
            2,
            RootedComponent$SelectorsMock.Button$,
            expect.objectContaining({})
        );

        await expect(component.Button$.els()).resolves.toMatchObject([mockElement]);
        await expect(component.Button$.byIdx(1)).resolves.toMatchObject(mockElement);

        jest.clearAllMocks();
    });

    it('should have access to extended component$ selector elements with recent root', async () => {
        expect.assertions(6);

        const component = new RootedExtendedComponent$Mock();

        await expect(component.Button$.el()).resolves.toMatchObject(mockElement);
        expect(mockDefault$Config.elSelectorFn).toHaveBeenNthCalledWith(
            1,
            RootedExtendedComponent$SelectorsMock.ExtendedRoot$
        );
        expect(mockDefault$Config.elSelectorFn).toHaveBeenNthCalledWith(
            2,
            RootedComponent$SelectorsMock.Button$,
            expect.objectContaining({})
        );

        await expect(component.ExtendedButton$.el()).resolves.toMatchObject(mockElement);
        expect(mockDefault$Config.elSelectorFn).toHaveBeenNthCalledWith(
            3,
            RootedExtendedComponent$SelectorsMock.ExtendedRoot$
        );
        expect(mockDefault$Config.elSelectorFn).toHaveBeenNthCalledWith(
            4,
            RootedExtendedComponent$SelectorsMock.ExtendedButton$,
            expect.objectContaining({})
        );

        jest.clearAllMocks();
    });

    it('should use different selector configs for parent and child component', async () => {
        expect.assertions(6);

        const component = new RootedMixedComponent$Mock();

        await expect(component.Button$.el()).resolves.toMatchObject(mockElement);
        expect(mockDefault$Config.elSelectorFn).toHaveBeenNthCalledWith(1, RootedComponent$SelectorsMock.Root$);
        expect(mockDefault$Config.elSelectorFn).toHaveBeenNthCalledWith(
            2,
            RootedComponent$SelectorsMock.Button$,
            expect.objectContaining({})
        );

        await expect(component.Button.el()).resolves.toMatchObject(mockElement);
        expect(mockDefaultConfig.elSelectorFn).toHaveBeenNthCalledWith(1, RootedComponent$SelectorsMock.Root$);
        expect(mockDefaultConfig.elSelectorFn).toHaveBeenNthCalledWith(
            2,
            RootedComponentSelectorsMock.Button,
            expect.objectContaining({})
        );
    });

    it('can have default root selector from the selectors enum', async () => {
        expect.assertions(1);

        const component = new DefaultRootRootedComponent$Mock();
        await component.waitForDisplayed({ reverse: true });
        expect(mockDefault$Config.elSelectorFn).toHaveBeenNthCalledWith(1, RootedComponent$SelectorsMock.Root$);
    });
});
