import { describe, expect, it, jest } from '@jest/globals';

import { mockDefaultConfig, mockElement } from '../../element.mock';
import { ComponentSelectorsMock } from '../mocks/component-selectors.mock';
import { ComponentMock } from '../mocks/component.mock';
import { ExtendedComponentMock } from '../mocks/extended-component.mock';
import { ParentComponentSelectorsMock } from '../mocks/parent-component-selectors.mock';

describe('getExtendedComponent', () => {
    it('resolves an awaited instance to the component itself, since the proxy exposes no then method', async () => {
        expect.assertions(2);

        const component = new ExtendedComponentMock();

        const awaited = await Promise.resolve(component);

        expect(awaited).toBe(component);
        await expect(awaited.Button.el()).resolves.toBe(mockElement);
    });

    it('resolves a css-like selector from the selectors enum to a child element', async () => {
        expect.assertions(2);

        const component = new ComponentMock();

        await expect(component.CSSSelector.el()).resolves.toBe(mockElement);
        expect(mockDefaultConfig.elSelectorFn).toHaveBeenCalledWith(ParentComponentSelectorsMock.CSSSelector);
    });

    it('should get enum selector methods from parent class', async () => {
        expect.assertions(4);

        const component = new ComponentMock();

        await expect(component.ParentButton.el()).resolves.toBe(mockElement);
        expect(mockDefaultConfig.elSelectorFn).toHaveBeenCalledWith(ParentComponentSelectorsMock.ParentButton);

        await expect(component.Button.el()).resolves.toBe(mockElement);
        expect(mockDefaultConfig.elSelectorFn).toHaveBeenCalledWith(ComponentSelectorsMock.Button);
    });

    it('should throw error on calling not supported proxy method', () => {
        expect.assertions(1);

        const component = new ComponentMock() as unknown as { IDONOTEXISTS: () => void };

        expect(() => void component.IDONOTEXISTS()).toThrow(TypeError);
    });

    it('should get wdio element by selector using method el', async () => {
        expect.assertions(2);

        const component = new ComponentMock();

        await expect(component.Button.el()).resolves.toBe(mockElement);
        expect(mockDefaultConfig.elSelectorFn).toHaveBeenCalledWith(ComponentSelectorsMock.Button);
    });

    it('should get wdio elements array by selector using method els', async () => {
        expect.assertions(2);

        const component = new ComponentMock();
        const getChildElsSpy = jest.spyOn(component, 'getChildEls');

        await expect(component.Button.els()).resolves.toContain(mockElement);
        expect(getChildElsSpy).toHaveBeenCalledWith(ComponentSelectorsMock.Button);
    });

    it('should add selectors enum methods for clicking element using click', async () => {
        expect.assertions(2);

        const component = new ComponentMock();

        await expect(component.Button.click()).resolves.toBe(void 0);
        expect(mockDefaultConfig.elSelectorFn).toHaveBeenCalledWith(ComponentSelectorsMock.Button);
    });

    it('should add selectors enum methods for getting element text using getText', async () => {
        expect.assertions(2);

        const component = new ComponentMock();

        await expect(component.Button.getText()).resolves.toBe('');
        expect(mockDefaultConfig.elSelectorFn).toHaveBeenCalledWith(ComponentSelectorsMock.Button);
    });

    it('should add selectors enum methods for getting element displayed status with suffix IsDisplayed', async () => {
        expect.assertions(2);

        const component = new ComponentMock();

        await expect(component.Button.isDisplayed()).resolves.toBe(true);
        expect(mockDefaultConfig.elSelectorFn).toHaveBeenCalledWith(ComponentSelectorsMock.Button);
    });

    it('should add selectors enum methods for getting element existing status with suffix Exists', async () => {
        expect.assertions(2);

        const component = new ComponentMock();

        await expect(component.Button.isExisting()).resolves.toBe(true);
        expect(mockDefaultConfig.elSelectorFn).toHaveBeenCalledWith(ComponentSelectorsMock.Button);
    });

    it('should add selectors enum methods for waiting element to exist with suffix WaitForExists', async () => {
        expect.assertions(2);

        const component = new ComponentMock();

        await expect(component.Button.waitForExist({ reverse: true })).resolves.toBe(void 0);
        expect(mockDefaultConfig.elSelectorFn).toHaveBeenCalledWith(ComponentSelectorsMock.Button);
    });

    it('should add selectors enum methods for waiting element to be displayed with suffix WaitForDisplayed', async () => {
        expect.assertions(2);

        const component = new ComponentMock();

        await expect(component.Button.waitForDisplayed({ reverse: true })).resolves.toBe(void 0);
        expect(mockDefaultConfig.elSelectorFn).toHaveBeenCalledWith(ComponentSelectorsMock.Button);
    });

    it('should add selectors enum methods for waiting element to be enabled with suffix WaitForEnabled', async () => {
        expect.assertions(2);

        const component = new ComponentMock();

        await expect(component.Button.waitForEnabled({ reverse: true })).resolves.toBe(void 0);
        expect(mockDefaultConfig.elSelectorFn).toHaveBeenCalledWith(ComponentSelectorsMock.Button);
    });

    it('should add selectors enum methods for setting element value with suffix SetValue', async () => {
        expect.assertions(2);

        const component = new ComponentMock();

        await expect(component.Button.setValue('')).resolves.toBe(void 0);
        expect(mockDefaultConfig.elSelectorFn).toHaveBeenCalledWith(ComponentSelectorsMock.Button);
    });

    it('should add selectors enum methods for getting element location with getLocation', async () => {
        expect.assertions(2);

        const component = new ComponentMock();

        await expect(component.Button.getLocation()).resolves.toMatchObject({ x: 0, y: 0 });
        expect(mockDefaultConfig.elSelectorFn).toHaveBeenCalledWith(ComponentSelectorsMock.Button);
    });

    it('should add selectors enum methods for getting element size with getSize', async () => {
        expect.assertions(2);

        const component = new ComponentMock();

        await expect(component.Button.getSize()).resolves.toMatchObject({ width: 0, height: 0 });
        expect(mockDefaultConfig.elSelectorFn).toHaveBeenCalledWith(ComponentSelectorsMock.Button);
    });

    it('should support intellisense for external files', async () => {
        expect.assertions(4);

        const component = new ComponentMock();

        await expect(component.Button.el()).resolves.toBe(mockElement);
        expect(mockDefaultConfig.elSelectorFn).toHaveBeenCalledWith(ComponentSelectorsMock.Button);

        await expect(component.ParentButton.el()).resolves.toBe(mockElement);
        expect(mockDefaultConfig.elSelectorFn).toHaveBeenCalledWith(ComponentSelectorsMock.Button);
    });

    it('throws a TypeError accessing a method missing from both selectors and the wdio element', () => {
        expect.assertions(1);

        const component = new ComponentMock();

        // @ts-expect-error property does not exist on selectors
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        expect(() => void component.Button.IDONOTEXISTS()).toThrow(TypeError);
    });

    it('preserves own and parent instance state across extended class method calls', () => {
        expect.assertions(2);

        const component = new ExtendedComponentMock();

        const testData = 'test-data';
        component.setTestData(testData);

        expect(component.getTestData()).toBe(testData);

        const parentTestData = 'parent-test-data';
        component.setParentData(parentTestData);

        expect(component.getParentData()).toBe(parentTestData);
    });

    it('preserves own and parent instance state across extended class getters and setters', () => {
        expect.assertions(2);

        const component = new ExtendedComponentMock();

        const testData = 'test-data';
        component.TestData = testData;

        expect(component.TestData).toBe(testData);

        const parentTestData = 'parent-test-data';
        component.ParentData = parentTestData;

        expect(component.ParentData).toBe(parentTestData);
    });
});
