import { describe, expect, it, jest } from '@jest/globals';

import { mockDefaultConfig, mockElement } from '../../element.mock';
import { DefaultRootRootedExtendedComponentMock } from '../mocks/default-root-rooted-extended-component.mock';
import { RootedComponentSelectorsMock } from '../mocks/rooted-component-selectors.mock';
import { RootedComponentMock } from '../mocks/rooted-component.mock';
import { RootedExtendedComponentMock } from '../mocks/rooted-extended-component.mock';
import { RootedOverrideComponentMock } from '../mocks/rooted-override-component.mock';
import { RootedParentComponentSelectorsMock } from '../mocks/rooted-parent-component-selectors.mock';

 
describe('getExtendedRootedComponent', () => {
    it('resolves RootEl to the root element found by the Root selector', async () => {
        expect.assertions(2);

        const component = new RootedComponentMock(RootedComponentSelectorsMock.Root);

        await expect(component.RootEl).resolves.toBe(mockElement);
        expect(mockDefaultConfig.elSelectorFn).toHaveBeenNthCalledWith(1, RootedComponentSelectorsMock.Root);

        jest.clearAllMocks();
    });

    it('exposes inherited RootedComponent element methods on extended class instances', async () => {
        expect.assertions(4);

        const component = new RootedComponentMock(RootedComponentSelectorsMock.Root);

        await component.Button.waitForDisplayed();

        expect(mockDefaultConfig.elSelectorFn).toHaveBeenNthCalledWith(1, RootedComponentSelectorsMock.Root);
        expect(mockDefaultConfig.elSelectorFn).toHaveBeenNthCalledWith(
            2,
            RootedComponentSelectorsMock.Button,
            expect.objectContaining({})
        );

        await component.ParentButton.waitForDisplayed();

        expect(mockDefaultConfig.elSelectorFn).toHaveBeenNthCalledWith(3, RootedComponentSelectorsMock.Root);
        expect(mockDefaultConfig.elSelectorFn).toHaveBeenNthCalledWith(
            4,
            RootedParentComponentSelectorsMock.ParentButton,
            expect.objectContaining({})
        );
    });

    it('should use correct "latest" root selector from overloaded constructor in all parents chain', async () => {
        expect.assertions(2);

        const component = new RootedOverrideComponentMock();

        await component.RootEl.waitForDisplayed();

        expect(mockDefaultConfig.elSelectorFn).toHaveBeenCalledWith(RootedComponentSelectorsMock.CustomRoot);

        await component.ParentButton.el().waitForDisplayed();

        expect(mockDefaultConfig.elSelectorFn).toHaveBeenCalledWith(
            RootedParentComponentSelectorsMock.ParentButton,
            expect.objectContaining({})
        );
    });

    it('should have all wdio element methods accessible on RootEl', async () => {
        expect.assertions(1);

        const component = new RootedComponentMock(RootedComponentSelectorsMock.Root);
        await component.waitForDisplayed({ reverse: true });

        expect(mockDefaultConfig.elSelectorFn).toHaveBeenCalledWith(RootedComponentSelectorsMock.CustomRoot);
    });

    it('preserves own and parent instance state across extended rooted class method calls', () => {
        expect.assertions(2);

        const component = new RootedExtendedComponentMock();

        const testData = 'test-data';
        component.setTestData(testData);

        expect(component.getTestData()).toBe(testData);

        const parentTestData = 'parent-test-data';
        component.setParentData(parentTestData);

        expect(component.getParentData()).toBe(parentTestData);
    });

    it('preserves own and parent instance state across extended rooted class getters and setters', () => {
        expect.assertions(2);

        const Ctor = RootedExtendedComponentMock;
        const component = new Ctor();

        const testData = 'test-data-1';
        component.TestData = testData;

        expect(component.TestData).toBe(testData);

        const parentTestData = 'test-data-2';
        component.ParentData = parentTestData;

        expect(component.ParentData).toBe(parentTestData);
    });

    it('should use override constructor selectorOrElement arg as RootEl', async () => {
        expect.assertions(2);

        const component = new RootedExtendedComponentMock();

        await expect(component.Button.el()).resolves.toBe(mockElement);
        expect(mockDefaultConfig.elSelectorFn).toHaveBeenCalledWith(RootedComponentSelectorsMock.CustomRoot);
    });

    it('should return component from async functions', async () => {
        expect.assertions(2);

        const asyncFn = async (): Promise<RootedExtendedComponentMock> => {
            const component = new RootedExtendedComponentMock();

            await expect(component.Button.el()).resolves.toBe(mockElement);

            return component;
        };

        const awaitedComponent = await asyncFn();

        await expect(awaitedComponent.Button.el()).resolves.toBe(mockElement);
    });

    it('resolves an awaited rooted instance to the component itself, since the proxy guards then from RootEl', async () => {
        expect.assertions(2);

        const component = new RootedExtendedComponentMock();

        const awaited = await Promise.resolve(component);

        expect(awaited).toBe(component);
        await expect(awaited.RootEl).resolves.toBe(mockElement);
    });

    it('falls back to the enum CustomRoot selector when the extended class passes no root argument', async () => {
        expect.assertions(1);

        const component = new DefaultRootRootedExtendedComponentMock();
        await component.waitForDisplayed({ reverse: true });

        expect(mockDefaultConfig.elSelectorFn).toHaveBeenCalledWith(RootedComponentSelectorsMock.CustomRoot);
    });
});
