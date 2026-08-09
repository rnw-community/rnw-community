import { describe, expect, it } from '@jest/globals';

import { mockDefaultConfig, mockElement } from '../../element.mock';
import { RootedComponentSelectorsMock } from '../mocks/rooted-component-selectors.mock';

import { createRootedComponent } from './create-rooted-component';

describe('createRootedComponent', () => {
    it('should create RootedComponent instance with selectors, using selector as root', async () => {
        expect.assertions(3);

        const component = createRootedComponent(RootedComponentSelectorsMock, RootedComponentSelectorsMock.Root);

        await expect(component.Button.el()).resolves.toBe(mockElement);
        expect(mockDefaultConfig.elSelectorFn).toHaveBeenNthCalledWith(1, RootedComponentSelectorsMock.Root);
        expect(mockDefaultConfig.elSelectorFn).toHaveBeenNthCalledWith(
            2,
            RootedComponentSelectorsMock.Button,
            expect.objectContaining({})
        );
    });

    it('should create RootedComponent instance with selectors, using Root selector from enum', async () => {
        expect.assertions(1);

        const component = createRootedComponent(RootedComponentSelectorsMock, RootedComponentSelectorsMock.Root);

        await expect(component.Button.el()).resolves.toBe(mockElement);
    });

    it('should create RootedComponent instance with selectors, using wdio element as root', async () => {
        expect.assertions(2);

        const component = createRootedComponent(RootedComponentSelectorsMock, mockElement);

        await expect(component.Button.el()).resolves.toBe(mockElement);
        expect(mockDefaultConfig.elSelectorFn).toHaveBeenCalledWith(
            RootedComponentSelectorsMock.Button,
            expect.objectContaining({})
        );
    });
});
