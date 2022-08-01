import { testID$, testID$$, testID$$Index } from '../../command';
import { mockElement } from '../element.mock';

import { Component } from './component';

import type {
    ClickArgs,
    SetValueArgs,
    WaitForDisplayedArgs,
    WaitForEnabledArgs,
    WaitForExistArgs,
} from '../type/wdio-types.type';

jest.mock('../../command', () => ({
    testID$: jest.fn(() => Promise.resolve(mockElement)),
    testID$$: jest.fn(() => Promise.resolve([mockElement])),
    testID$$Index: jest.fn(() => Promise.resolve(mockElement)),
}));

// eslint-disable-next-line max-lines-per-function,max-statements
describe('Component', () => {
    it('should return wdio element by selector using getChildEl', async () => {
        expect.assertions(1);

        const component = new Component();

        await component.getChildEl('test-selector');
        expect(testID$).toHaveBeenCalledWith('test-selector');
    });

    it('should return array of wdio elements by selector using getChildEls', async () => {
        expect.assertions(1);

        const component = new Component();

        await component.getChildEls('test-selector');
        expect(testID$$).toHaveBeenCalledWith('test-selector');
    });

    it('should return nth wdio element by selector using getChildElByIdx', async () => {
        expect.assertions(1);

        const component = new Component();

        await component.getChildElByIdx('test-selector', 1);
        expect(testID$$Index).toHaveBeenCalledWith('test-selector', 1);
    });

    it('should click wdio element by selector using clickChildEl', async () => {
        expect.assertions(2);

        const component = new Component();

        const getChildElSpy = jest.spyOn(component, 'getChildEl');
        const elementClickSpy = jest.spyOn(mockElement, 'click');
        getChildElSpy.mockImplementation(() => Promise.resolve(mockElement as unknown as WebdriverIO.Element));

        const args: ClickArgs = [{ button: 1 }];
        await component.clickChildEl('test-selector', ...args);

        expect(getChildElSpy).toHaveBeenCalledWith('test-selector');
        expect(elementClickSpy).toHaveBeenCalledWith(...args);
    });

    it('should click nth wdio element by selector using clickByIdxChildEl', async () => {
        expect.assertions(2);

        const component = new Component();

        const getChildElByIdxSpy = jest.spyOn(component, 'getChildElByIdx');
        const elementClickSpy = jest.spyOn(mockElement, 'click');
        getChildElByIdxSpy.mockImplementation(() => Promise.resolve(mockElement as unknown as WebdriverIO.Element));

        const args: ClickArgs = [{ button: 1 }];
        await component.clickByIdxChildEl('test-selector', 1, ...args);

        expect(getChildElByIdxSpy).toHaveBeenCalledWith('test-selector', 1);
        expect(elementClickSpy).toHaveBeenCalledWith(...args);
    });

    it('should set value  for wdio element by selector using setValueChildEl', async () => {
        expect.assertions(2);

        const component = new Component();

        const getChildElSpy = jest.spyOn(component, 'getChildEl');
        const elementSetValueSpy = jest.spyOn(mockElement, 'setValue');
        getChildElSpy.mockImplementation(() => Promise.resolve(mockElement as unknown as WebdriverIO.Element));

        const args: SetValueArgs = [''];
        await component.setValueChildEl('test-selector', ...args);

        expect(getChildElSpy).toHaveBeenCalledWith('test-selector');
        expect(elementSetValueSpy).toHaveBeenCalledWith(...args);
    });

    it('should get wdio element displayed status by selector using isDisplayedChildEl', async () => {
        expect.assertions(3);

        const component = new Component();

        const getChildElSpy = jest.spyOn(component, 'getChildEl');
        const elementIsDisplayedSpy = jest.spyOn(mockElement, 'isDisplayed');
        getChildElSpy.mockImplementation(() => Promise.resolve(mockElement as unknown as WebdriverIO.Element));

        await expect(component.isDisplayedChildEl('test-selector')).resolves.toBe(true);

        expect(getChildElSpy).toHaveBeenCalledWith('test-selector');
        expect(elementIsDisplayedSpy).toHaveBeenCalledWith();
    });

    it('should get wdio element existing status by selector using isExistingChildEl', async () => {
        expect.assertions(3);

        const component = new Component();

        const getChildElSpy = jest.spyOn(component, 'getChildEl');
        const elementIsExistingSpy = jest.spyOn(mockElement, 'isExisting');
        getChildElSpy.mockImplementation(() => Promise.resolve(mockElement as unknown as WebdriverIO.Element));

        await expect(component.isExistingChildEl('test-selector')).resolves.toBe(true);

        expect(getChildElSpy).toHaveBeenCalledWith('test-selector');
        expect(elementIsExistingSpy).toHaveBeenCalledWith();
    });

    it('should get wdio element text by selector using getTextChildEl', async () => {
        expect.assertions(3);

        const component = new Component();

        const getChildElSpy = jest.spyOn(component, 'getChildEl');
        const elementGetTextSpy = jest.spyOn(mockElement, 'getText');
        getChildElSpy.mockImplementation(() => Promise.resolve(mockElement as unknown as WebdriverIO.Element));

        await expect(component.getTextChildEl('test-selector')).resolves.toBe('');

        expect(getChildElSpy).toHaveBeenCalledWith('test-selector');
        expect(elementGetTextSpy).toHaveBeenCalledWith();
    });

    it('should wait for wdio element to exist by selector using waitForExistsChildEl', async () => {
        expect.assertions(2);

        const component = new Component();

        const getChildElSpy = jest.spyOn(component, 'getChildEl');
        const elementWaitForExistsSpy = jest.spyOn(mockElement, 'waitForExist');
        getChildElSpy.mockImplementation(() => Promise.resolve(mockElement as unknown as WebdriverIO.Element));

        const args: WaitForExistArgs = [{ reverse: true }];
        await component.waitForExistChildEl('test-selector', ...args);

        expect(getChildElSpy).toHaveBeenCalledWith('test-selector');
        expect(elementWaitForExistsSpy).toHaveBeenCalledWith(...args);
    });

    it('should wait for wdio element to be displayed by selector using waitForDisplayedChildEl', async () => {
        expect.assertions(2);

        const component = new Component();

        const getChildElSpy = jest.spyOn(component, 'getChildEl');
        const elementWaitForDisplayedSpy = jest.spyOn(mockElement, 'waitForDisplayed');
        getChildElSpy.mockImplementation(() => Promise.resolve(mockElement as unknown as WebdriverIO.Element));

        const args: WaitForDisplayedArgs = [{ reverse: true }];
        await component.waitForDisplayedChildEl('test-selector', ...args);

        expect(getChildElSpy).toHaveBeenCalledWith('test-selector');
        expect(elementWaitForDisplayedSpy).toHaveBeenCalledWith(...args);
    });

    it('should wait for wdio element to be enabled by selector using waitForEnabledChildEl', async () => {
        expect.assertions(2);

        const component = new Component();

        const getChildElSpy = jest.spyOn(component, 'getChildEl');
        const elementWaitForEnabledSpy = jest.spyOn(mockElement, 'waitForEnabled');
        getChildElSpy.mockImplementation(() => Promise.resolve(mockElement as unknown as WebdriverIO.Element));

        const args: WaitForEnabledArgs = [{ reverse: true }];
        await component.waitForEnabledChildEl('test-selector', ...args);

        expect(getChildElSpy).toHaveBeenCalledWith('test-selector');
        expect(elementWaitForEnabledSpy).toHaveBeenCalledWith(...args);
    });

    it('should get wdio element size by selector using getSizeChildEl', async () => {
        expect.assertions(3);

        const component = new Component();

        const getChildElSpy = jest.spyOn(component, 'getChildEl');
        const elementGetSizeSpy = jest.spyOn(mockElement, 'getSize');
        getChildElSpy.mockImplementation(() => Promise.resolve(mockElement as unknown as WebdriverIO.Element));

        await expect(component.getSizeChildEl('test-selector')).resolves.toMatchObject({ width: 0, height: 0 });

        expect(getChildElSpy).toHaveBeenCalledWith('test-selector');
        expect(elementGetSizeSpy).toHaveBeenCalledWith();
    });

    it('should get wdio element location by selector using getSizeChildEl', async () => {
        expect.assertions(3);

        const component = new Component();

        const getChildElSpy = jest.spyOn(component, 'getChildEl');
        const elementGetLocationSpy = jest.spyOn(mockElement, 'getLocation');
        getChildElSpy.mockImplementation(() => Promise.resolve(mockElement as unknown as WebdriverIO.Element));

        await expect(component.getLocationChildEl('test-selector')).resolves.toMatchObject({ x: 0, y: 0 });

        expect(getChildElSpy).toHaveBeenCalledWith('test-selector');
        expect(elementGetLocationSpy).toHaveBeenCalledWith();
    });
});
