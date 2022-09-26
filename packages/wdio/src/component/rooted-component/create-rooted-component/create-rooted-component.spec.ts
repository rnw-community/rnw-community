import { mockDefaultConfig, mockElement } from '../../element.mock';

import { createRootedComponent } from './create-rooted-component';

enum Selectors {
    Button = 'Selectors.Button',
    Root = 'Selectors.Root',
}

describe('create-rooted-component', () => {
    it('should create RootedComponent instance with selectors, using selector as root', async () => {
        expect.assertions(3);

        const component = createRootedComponent(Selectors, Selectors.Button);

        await expect(component.Button.el()).resolves.toMatchObject(mockElement);
        expect(mockDefaultConfig.elSelectorFn).toHaveBeenNthCalledWith(1, Selectors.Button);
        expect(mockDefaultConfig.elSelectorFn).toHaveBeenNthCalledWith(2, Selectors.Button, mockElement);
    });
    it('should create RootedComponent instance with selectors, using Root selector from enum', async () => {
        expect.assertions(1);

        const component = createRootedComponent(Selectors);

        await expect(component.Button.el()).resolves.toMatchObject(mockElement);
    });
    it('should create RootedComponent instance with selectors, using wdio element as root', async () => {
        expect.assertions(2);

        const component = createRootedComponent(Selectors, mockElement as unknown as WebdriverIO.Element);

        await expect(component.Button.el()).resolves.toMatchObject(mockElement);
        expect(mockDefaultConfig.elSelectorFn).toHaveBeenCalledWith(Selectors.Button, mockElement);
    });
});
