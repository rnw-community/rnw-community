import { mockDefaultConfig, mockElement } from '../../element.mock';
import { ComponentSelectorsMock } from '../mocks/component-selectors.mock';
import { ComponentMock } from '../mocks/component.mock';
import { ExtendedComponentMock } from '../mocks/extended-component.mock';
import { ParentComponentSelectorsMock } from '../mocks/parent-component-selectors.mock';

// eslint-disable-next-line max-lines-per-function,max-statements
describe('getExtendedComponent', () => {
    // TODO: Move to component tests
    it('should work with css-like selector methods', async () => {
        expect.assertions(2);

        const component = new ComponentMock();

        await expect(component.CSSSelector.el()).resolves.toMatchObject(mockElement);
        expect(mockDefaultConfig.elSelectorFn).toHaveBeenCalledWith(ParentComponentSelectorsMock.CSSSelector);
    });

    it('should get enum selector methods from parent class', async () => {
        expect.assertions(4);

        const component = new ComponentMock();

        await expect(component.ParentButton.el()).resolves.toMatchObject(mockElement);
        expect(mockDefaultConfig.elSelectorFn).toHaveBeenCalledWith(ParentComponentSelectorsMock.ParentButton);

        await expect(component.Button.el()).resolves.toMatchObject(mockElement);
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

        await expect(component.Button.el()).resolves.toMatchObject(mockElement);
        expect(mockDefaultConfig.elSelectorFn).toHaveBeenCalledWith(ComponentSelectorsMock.Button);
    });

    it('should get wdio elements array by selector using method els', async () => {
        expect.assertions(2);

        const component = new ComponentMock();
        const getChildElsSpy = jest.spyOn(component, 'getChildEls');

        await expect(component.Button.els()).resolves.toContain(mockElement);
        expect(getChildElsSpy).toHaveBeenCalledWith(ComponentSelectorsMock.Button);
    });

    it('should get nth wdio element by selector using method byIdx', async () => {
        expect.assertions(2);

        const component = new ComponentMock();
        const getChildElByIdxSpy = jest.spyOn(component, 'getChildElByIdx');

        await expect(component.Button.byIdx(1)).resolves.toMatchObject(mockElement);
        expect(getChildElByIdxSpy).toHaveBeenCalledWith(ComponentSelectorsMock.Button, 1);
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

        await expect(component.Button.el()).resolves.toMatchObject(mockElement);
        expect(mockDefaultConfig.elSelectorFn).toHaveBeenCalledWith(ComponentSelectorsMock.Button);

        await expect(component.ParentButton.el()).resolves.toMatchObject(mockElement);
        expect(mockDefaultConfig.elSelectorFn).toHaveBeenCalledWith(ComponentSelectorsMock.Button);
    });

    it('should throw error on accessing not existing selector element/wdio element property', () => {
        expect.assertions(1);

        const component = new ComponentMock();

        // @ts-expect-error Test
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        expect(() => void component.Button.IDONOTEXISTS()).toThrow(TypeError);
    });

    it('should call extended class methods and change class state', () => {
        expect.assertions(2);

        const component = new ExtendedComponentMock();

        const testData = 'test-data';
        component.setTestData(testData);
        expect(component.getTestData()).toBe(testData);

        const parentTestData = 'parent-test-data';
        component.setParentData(parentTestData);
        expect(component.getParentData()).toBe(parentTestData);
    });

    it('should call extended class getters/setters and change class state', () => {
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
