// eslint-disable-next-line max-classes-per-file
import { expectTypeOf } from 'expect-type';

import { mockDefaultConfig, mockElement } from '../../element.mock';
import { ComponentSelectorsMock } from '../../mocks/component-selectors.mock';
import { ComponentMock } from '../../mocks/component.mock';
import { Component } from '../component';

import { getExtendedComponent } from './get-extended-component';

// TODO: Extract mocks from the test
enum SelectorsEnum {
    Button = 'Selectors.Button',
}

enum AdditionalSelectorsEnum {
    CSSSelector = '.my-lib-class',
    Toggle = 'AdditionalSelectorsEnum.Toggle',
}

class ParentComponent extends getExtendedComponent(AdditionalSelectorsEnum, Component) {
    getter = 'Getter';

    get Getter(): string {
        return this.getter;
    }

    method(): string {
        return this.getter;
    }
}
class CustomComponent extends getExtendedComponent(SelectorsEnum, ParentComponent) {}

// eslint-disable-next-line max-lines-per-function,max-statements
describe('getExtendedComponent', () => {
    // TODO: Move to component tests
    it('should work with css-like selector methods', async () => {
        expect.assertions(2);

        const component = new CustomComponent();

        expectTypeOf(component.CSSSelector.el).toBeFunction();
        await expect(component.CSSSelector.el()).resolves.toMatchObject(mockElement);
        expect(mockDefaultConfig.elSelectorFn).toHaveBeenCalledWith(AdditionalSelectorsEnum.CSSSelector);
    });

    it('should get selector methods for enum from parent class', async () => {
        expect.assertions(4);

        const component = new CustomComponent();

        expectTypeOf(component.Toggle.el).toBeFunction();
        await expect(component.Toggle.el()).resolves.toMatchObject(mockElement);
        expect(mockDefaultConfig.elSelectorFn).toHaveBeenCalledWith(AdditionalSelectorsEnum.Toggle);

        expectTypeOf(component.Button.el).toBeFunction();
        await expect(component.Button.el()).resolves.toMatchObject(mockElement);
        expect(mockDefaultConfig.elSelectorFn).toHaveBeenCalledWith(SelectorsEnum.Button);
    });

    it('should throw error on calling not supported proxy method', () => {
        expect.assertions(1);

        const component = new CustomComponent() as unknown as { IDONOTEXISTS: () => void };

        expect(() => void component.IDONOTEXISTS()).toThrow(TypeError);
    });

    it('should get wdio element by selector using method el', async () => {
        expect.assertions(2);

        const component = new CustomComponent();

        expectTypeOf(component.Button.el).toBeFunction();
        await expect(component.Button.el()).resolves.toMatchObject(mockElement);
        expect(mockDefaultConfig.elSelectorFn).toHaveBeenCalledWith(SelectorsEnum.Button);
    });

    it('should get wdio elements array by selector using method els', async () => {
        expect.assertions(2);

        const component = new CustomComponent();
        const getChildElsSpy = jest.spyOn(component, 'getChildEls');

        expectTypeOf(component.Button.els).toBeFunction();
        await expect(component.Button.els()).resolves.toContain(mockElement);
        expect(getChildElsSpy).toHaveBeenCalledWith(SelectorsEnum.Button);
    });

    it('should get nth wdio element by selector using method byIdx', async () => {
        expect.assertions(2);

        const component = new CustomComponent();
        const getChildElByIdxSpy = jest.spyOn(component, 'getChildElByIdx');

        expectTypeOf(component.Button.byIdx).toBeFunction();
        await expect(component.Button.byIdx(1)).resolves.toMatchObject(mockElement);
        expect(getChildElByIdxSpy).toHaveBeenCalledWith(SelectorsEnum.Button, 1);
    });

    it('should add selectors enum methods for clicking element using click', async () => {
        expect.assertions(2);

        const component = new CustomComponent();
        const clickChildElSpy = jest.spyOn(component, 'clickChildEl');

        expectTypeOf(component.Button.click).toBeFunction();
        await expect(component.Button.click()).resolves.toBe(void 0);
        expect(clickChildElSpy).toHaveBeenCalledWith(SelectorsEnum.Button);
    });

    it('should add selectors enum methods for clicking element in array by index using clickByIdx', async () => {
        expect.assertions(2);

        const component = new CustomComponent();
        const clickByIdxChildElSpy = jest.spyOn(component, 'clickByIdxChildEl');

        expectTypeOf(component.Button.clickByIdx).toBeFunction();
        await expect(component.Button.clickByIdx(1)).resolves.toBe(void 0);
        expect(clickByIdxChildElSpy).toHaveBeenCalledWith(SelectorsEnum.Button, 1);
    });

    it('should add selectors enum methods for getting element text using getText', async () => {
        expect.assertions(2);

        const component = new CustomComponent();
        const getTextChildElSpy = jest.spyOn(component, 'getTextChildEl');

        expectTypeOf(component.Button.getText).toBeFunction();
        await expect(component.Button.getText()).resolves.toBe('');
        expect(getTextChildElSpy).toHaveBeenCalledWith(SelectorsEnum.Button);
    });

    it('should add selectors enum methods for getting element displayed status with suffix IsDisplayed', async () => {
        expect.assertions(2);

        const component = new CustomComponent();
        const isDisplayedChildElSpy = jest.spyOn(component, 'isDisplayedChildEl');

        expectTypeOf(component.Button.isDisplayed).toBeFunction();
        await expect(component.Button.isDisplayed()).resolves.toBe(true);
        expect(isDisplayedChildElSpy).toHaveBeenCalledWith(SelectorsEnum.Button);
    });

    it('should add selectors enum methods for getting element existing status with suffix Exists', async () => {
        expect.assertions(2);

        const component = new CustomComponent();
        const isExistingChildElSpy = jest.spyOn(component, 'isExistingChildEl');

        expectTypeOf(component.Button.isExisting).toBeFunction();
        await expect(component.Button.isExisting()).resolves.toBe(true);
        expect(isExistingChildElSpy).toHaveBeenCalledWith(SelectorsEnum.Button);
    });

    it('should add selectors enum methods for waiting element to exist with suffix WaitForExists', async () => {
        expect.assertions(2);

        const component = new CustomComponent();
        const waitForExistChildElSpy = jest.spyOn(component, 'waitForExistChildEl');

        expectTypeOf(component.Button.waitForExist).toBeFunction();
        await expect(component.Button.waitForExist({ reverse: true })).resolves.toBe(void 0);
        expect(waitForExistChildElSpy).toHaveBeenCalledWith(SelectorsEnum.Button, { reverse: true });
    });

    it('should add selectors enum methods for waiting element to be displayed with suffix WaitForDisplayed', async () => {
        expect.assertions(2);

        const component = new CustomComponent();
        const waitForDisplayedChildElSpy = jest.spyOn(component, 'waitForDisplayedChildEl');

        expectTypeOf(component.Button.waitForDisplayed).toBeFunction();
        await expect(component.Button.waitForDisplayed({ reverse: true })).resolves.toBe(void 0);
        expect(waitForDisplayedChildElSpy).toHaveBeenCalledWith(SelectorsEnum.Button, { reverse: true });
    });

    it('should add selectors enum methods for waiting element to be enabled with suffix WaitForEnabled', async () => {
        expect.assertions(2);

        const component = new CustomComponent();
        const waitForEnabledChildElSpy = jest.spyOn(component, 'waitForEnabledChildEl');

        expectTypeOf(component.Button.waitForEnabled).toBeFunction();
        await expect(component.Button.waitForEnabled({ reverse: true })).resolves.toBe(void 0);
        expect(waitForEnabledChildElSpy).toHaveBeenCalledWith(SelectorsEnum.Button, { reverse: true });
    });

    it('should add selectors enum methods for setting element value with suffix SetValue', async () => {
        expect.assertions(2);

        const component = new CustomComponent();
        const setValueChildElSpy = jest.spyOn(component, 'setValueChildEl');

        expectTypeOf(component.Button.setValue).toBeFunction();
        await expect(component.Button.setValue('')).resolves.toBe(void 0);
        expect(setValueChildElSpy).toHaveBeenCalledWith(SelectorsEnum.Button, '');
    });

    it('should add selectors enum methods for getting element location with getLocation', async () => {
        expect.assertions(2);

        const component = new CustomComponent();
        const getLocationChildElSpy = jest.spyOn(component, 'getLocationChildEl');

        expectTypeOf(component.Button.getLocation).toBeFunction();
        await expect(component.Button.getLocation()).resolves.toMatchObject({ x: 0, y: 0 });
        expect(getLocationChildElSpy).toHaveBeenCalledWith(SelectorsEnum.Button);
    });

    it('should add selectors enum methods for getting element size with getSize', async () => {
        expect.assertions(2);

        const component = new CustomComponent();
        const getSizeChildElSpy = jest.spyOn(component, 'getSizeChildEl');

        expectTypeOf(component.Button.getSize).toBeFunction();
        await expect(component.Button.getSize()).resolves.toMatchObject({ width: 0, height: 0 });
        expect(getSizeChildElSpy).toHaveBeenCalledWith(SelectorsEnum.Button);
    });

    it('should call extended component class getters', () => {
        expect.assertions(1);

        const component = new CustomComponent();
        expect(component.Getter).toBe('Getter');
    });

    it('should call extended component class methods', () => {
        expect.assertions(1);

        const component = new CustomComponent();
        expect(component.method()).toBe('Getter');
    });

    it('should support intellisense for external files', async () => {
        expect.assertions(4);

        const component = new ComponentMock();

        expectTypeOf(component.Button.el).toBeFunction();
        await expect(component.Button.el()).resolves.toMatchObject(mockElement);
        expect(mockDefaultConfig.elSelectorFn).toHaveBeenCalledWith(ComponentSelectorsMock.Button);

        expectTypeOf(component.ParentButton.el).toBeFunction();
        await expect(component.ParentButton.el()).resolves.toMatchObject(mockElement);
        expect(mockDefaultConfig.elSelectorFn).toHaveBeenCalledWith(ComponentSelectorsMock.Button);
    });
});
