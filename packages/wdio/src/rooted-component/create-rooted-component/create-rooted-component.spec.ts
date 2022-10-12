import { mockDefaultConfig, mockElement } from '../../element.mock';
import { RootedComponentSelectorsMock } from '../mocks/rooted-component-selectors.mock';

import { createRootedComponent } from './create-rooted-component';

import type { ChainablePromiseElement } from 'webdriverio';

describe('create-rooted-component', () => {
    it('should create RootedComponent instance with selectors, using selector as root', async () => {
        expect.assertions(3);

        const component = createRootedComponent(RootedComponentSelectorsMock, RootedComponentSelectorsMock.Button);

        await expect(component.Button.el()).resolves.toMatchObject(mockElement);
        expect(mockDefaultConfig.elSelectorFn).toHaveBeenNthCalledWith(1, RootedComponentSelectorsMock.Button);
        expect(mockDefaultConfig.elSelectorFn).toHaveBeenNthCalledWith(
            2,
            RootedComponentSelectorsMock.Button,
            expect.objectContaining({})
        );
    });

    it('should create RootedComponent instance with selectors, using Root selector from enum', async () => {
        expect.assertions(1);

        const component = createRootedComponent(RootedComponentSelectorsMock);

        await expect(component.Button.el()).resolves.toMatchObject(mockElement);
    });

    it('should create RootedComponent instance with selectors, using wdio element as root', async () => {
        expect.assertions(2);

        const component = createRootedComponent(
            RootedComponentSelectorsMock,
            Promise.resolve(mockElement) as unknown as ChainablePromiseElement<WebdriverIO.Element>
        );

        await expect(component.Button.el()).resolves.toMatchObject(mockElement);
        expect(mockDefaultConfig.elSelectorFn).toHaveBeenCalledWith(
            RootedComponentSelectorsMock.Button,
            expect.objectContaining({})
        );
    });
});
