// eslint-disable-next-line max-classes-per-file
import { expectTypeOf } from 'expect-type';

import { testID$ } from '../../command';
import { mockElement } from '../element.mock';

import { getComponent } from './get-component';

enum SelectorsEnum {
    Button = 'Selectors.Button',
}

class Component extends getComponent(SelectorsEnum) {}

jest.mock('../../command', () => ({
    testID$: jest.fn(() => Promise.resolve(mockElement)),
    testID$$: jest.fn(() => Promise.resolve([mockElement])),
    testID$$Index: jest.fn(() => Promise.resolve(mockElement)),
}));

// eslint-disable-next-line max-lines-per-function,max-statements
describe('getComponent', () => {
    it('should throw error on calling not supported proxy method', () => {
        expect.assertions(1);

        const component = new Component() as unknown as { IDONOTEXISTS: () => void };

        expect(() => void component.IDONOTEXISTS()).toThrow(TypeError);
    });

    it('should use constructor global context for getting elements', async () => {
        expect.assertions(1);

        const component = new Component(SelectorsEnum.Button);

        await component.Button.el();

        expect(testID$).toHaveBeenCalledWith(SelectorsEnum.Button);
    });

    it('should add selectors enum methods for finding single element with suffix El', async () => {
        expect.assertions(1);

        const component = new Component();
        const getChildElSpy = jest.spyOn(component, 'getChildEl');

        const buttonEl = await component.Button.el();

        expect(getChildElSpy).toHaveBeenCalledWith(SelectorsEnum.Button);
        expectTypeOf(buttonEl).toBeObject();
    });

    it('should add selectors enum methods for finding array of elements with suffix Els', async () => {
        expect.assertions(1);

        const component = new Component();
        const getChildElsSpy = jest.spyOn(component, 'getChildEls');

        const buttonEls = await component.Button.els();

        expect(getChildElsSpy).toHaveBeenCalledWith(SelectorsEnum.Button);
        expectTypeOf(buttonEls).toBeArray();
    });

    it('should add selectors enum methods for clicking element with suffix Click', async () => {
        expect.assertions(2);

        const component = new Component();
        const clickChildElSpy = jest.spyOn(component, 'clickChildEl');

        expectTypeOf(component.Button.click).toBeFunction();
        await expect(component.Button.click()).resolves.toBe(void 0);
        expect(clickChildElSpy).toHaveBeenCalledWith(SelectorsEnum.Button);
    });

    it('should add selectors enum methods for clicking element in array by index with suffix ClickByIdx', async () => {
        expect.assertions(2);

        const component = new Component();
        const clickByIdxChildElSpy = jest.spyOn(component, 'clickByIdxChildEl');

        expectTypeOf(component.Button.clickByIdx).toBeFunction();
        await expect(component.Button.clickByIdx(1)).resolves.toBe(void 0);
        expect(clickByIdxChildElSpy).toHaveBeenCalledWith(SelectorsEnum.Button, 1);
    });

    it('should add selectors enum methods for getting element text with suffix Text', async () => {
        expect.assertions(2);

        const component = new Component();
        const getTextChildElSpy = jest.spyOn(component, 'getTextChildEl');

        expectTypeOf(component.Button.getText).toBeFunction();
        await expect(component.Button.getText()).resolves.toBe('');
        expect(getTextChildElSpy).toHaveBeenCalledWith(SelectorsEnum.Button);
    });

    it('should add selectors enum methods for getting element displayed status with suffix IsDisplayed', async () => {
        expect.assertions(2);

        const component = new Component();
        const isDisplayedChildElSpy = jest.spyOn(component, 'isDisplayedChildEl');

        expectTypeOf(component.Button.isDisplayed).toBeFunction();
        await expect(component.Button.isDisplayed()).resolves.toBe(true);
        expect(isDisplayedChildElSpy).toHaveBeenCalledWith(SelectorsEnum.Button);
    });

    it('should add selectors enum methods for getting element existing status with suffix Exists', async () => {
        expect.assertions(2);

        const component = new Component();
        const isExistingChildElSpy = jest.spyOn(component, 'isExistingChildEl');

        expectTypeOf(component.Button.isExisting).toBeFunction();
        await expect(component.Button.isExisting()).resolves.toBe(true);
        expect(isExistingChildElSpy).toHaveBeenCalledWith(SelectorsEnum.Button);
    });

    it('should add selectors enum methods for waiting element to exist with suffix WaitForExists', async () => {
        expect.assertions(2);

        const component = new Component();
        const waitForExistChildElSpy = jest.spyOn(component, 'waitForExistsChildEl');

        expectTypeOf(component.Button.waitForExist).toBeFunction();
        await expect(component.Button.waitForExist({ reverse: true })).resolves.toBe(void 0);
        expect(waitForExistChildElSpy).toHaveBeenCalledWith(SelectorsEnum.Button, [{ reverse: true }]);
    });

    it('should add selectors enum methods for waiting element to be displayed with suffix WaitForDisplayed', async () => {
        expect.assertions(2);

        const component = new Component();
        const waitForDisplayedChildElSpy = jest.spyOn(component, 'waitForDisplayedChildEl');

        expectTypeOf(component.Button.waitForDisplayed).toBeFunction();
        await expect(component.Button.waitForDisplayed({ reverse: true })).resolves.toBe(void 0);
        expect(waitForDisplayedChildElSpy).toHaveBeenCalledWith(SelectorsEnum.Button, [{ reverse: true }]);
    });

    it('should add selectors enum methods for waiting element to be enabled with suffix WaitForEnabled', async () => {
        expect.assertions(2);

        const component = new Component();
        const waitForEnabledChildElSpy = jest.spyOn(component, 'waitForEnabledChildEl');

        expectTypeOf(component.Button.waitForEnabled).toBeFunction();
        await expect(component.Button.waitForEnabled({ reverse: true })).resolves.toBe(void 0);
        expect(waitForEnabledChildElSpy).toHaveBeenCalledWith(SelectorsEnum.Button, [{ reverse: true }]);
    });

    it('should add selectors enum methods for setting element value with suffix SetValue', async () => {
        expect.assertions(2);

        const component = new Component();
        const setValueChildElSpy = jest.spyOn(component, 'setValueChildEl');

        expectTypeOf(component.Button.setValue).toBeFunction();
        await expect(component.Button.setValue('')).resolves.toBe(void 0);
        expect(setValueChildElSpy).toHaveBeenCalledWith(SelectorsEnum.Button, ['']);
    });
});
