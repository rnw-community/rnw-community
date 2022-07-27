// eslint-disable-next-line max-classes-per-file
import { expectTypeOf } from 'expect-type';

import { testID$ } from '../../command';

import { getVisibleComponent } from './get-visible-component';

enum Selectors {
    Button = 'Selectors.Button',
    Root = 'Selectors.Root',
}

class Component extends getVisibleComponent<Selectors>(Selectors) {}

const elementMethods = {
    testID$: jest.fn(() => Promise.resolve({})),
    testID$$: jest.fn(() => Promise.resolve([{}])),
    click: jest.fn(() => Promise.resolve(void 0)),
    getText: jest.fn(() => Promise.resolve('')),
    isDisplayed: jest.fn(() => Promise.resolve(true)),
    isExisting: jest.fn(() => Promise.resolve(true)),
};

const mockElement = {
    click: jest.fn(() => Promise.resolve(void 0)),
    testID$: jest.fn(() => Promise.resolve(elementMethods)),
    testID$$: jest.fn(() => Promise.resolve(elementMethods)),
};

jest.mock('../../command', () => ({
    testID$: jest.fn(() => Promise.resolve(mockElement)),
    testID$$: jest.fn(() => Promise.resolve([mockElement])),
    click: jest.fn(() => Promise.resolve(void 0)),
}));

describe('getVisibleComponent', () => {
    it('should throw error on calling not supported proxy method', () => {
        expect.assertions(1);

        const component = new Component() as unknown as { IDONOTEXISTS: () => void };

        expect(() => void component.IDONOTEXISTS()).toThrow(TypeError);
    });

    it('should use Root enum selector as VisibleComponent RootEl', async () => {
        expect.assertions(1);

        const component = new Component();

        await component.ButtonEl;

        expect(testID$).toHaveBeenCalledWith(Selectors.Root);
    });

    it('should use constructor Root selector arg over Root enum selector as VisibleComponent RootEl', async () => {
        expect.assertions(1);

        const component = new Component(Selectors.Button);

        await component.ButtonEl;

        expect(testID$).toHaveBeenCalledWith(Selectors.Button);
    });

    it('should throw error if neither constructor Root selector arg nor Root enum selector is available', () => {
        expect.assertions(1);

        enum NoRootSelectors {
            Body = 'NoRootSelectors.Body',
        }

        class NoRootComponent extends getVisibleComponent<NoRootSelectors>(NoRootSelectors) {}

        expect(() => new NoRootComponent()).toThrow('Cannot create VisibleComponent - No Root element selector was passed');
    });

    it('should add selectors enum methods for finding single element with suffix El', async () => {
        expect.assertions(1);

        const component = new Component();
        const getChildElSpy = jest.spyOn(component, 'getChildEl');

        const buttonEl = await component.ButtonEl;

        expect(getChildElSpy).toHaveBeenCalledWith(Selectors.Button);
        expectTypeOf(buttonEl).toBeObject();
    });

    it('should add selectors enum methods for finding array of elements with suffix Els', async () => {
        expect.assertions(1);

        const component = new Component();
        const getChildElsSpy = jest.spyOn(component, 'getChildEls');

        const buttonEls = await component.ButtonEls;

        expect(getChildElsSpy).toHaveBeenCalledWith(Selectors.Button);
        expectTypeOf(buttonEls).toBeArray();
    });

    it('should add selectors enum methods for clicking element with suffix ElClick', async () => {
        expect.assertions(1);

        const component = new Component();
        const clickChildElSpy = jest.spyOn(component, 'clickChildEl');

        await component.ButtonElClick;

        expect(clickChildElSpy).toHaveBeenCalledWith(Selectors.Button);
    });

    it('should add selectors enum methods for getting element text with suffix ElText', async () => {
        expect.assertions(1);

        const component = new Component();
        const getTextChildElSpy = jest.spyOn(component, 'getTextChildEl');

        await component.ButtonElText;

        expect(getTextChildElSpy).toHaveBeenCalledWith(Selectors.Button);
    });

    it('should add selectors enum methods for getting element displayed status with suffix ElDisplayed', async () => {
        expect.assertions(1);

        const component = new Component();
        const isDisplayedChildElSpy = jest.spyOn(component, 'isDisplayedChildEl');

        await component.ButtonElDisplayed;

        expect(isDisplayedChildElSpy).toHaveBeenCalledWith(Selectors.Button);
    });

    it('should add selectors enum methods for getting element existing status with suffix ElExists', async () => {
        expect.assertions(1);

        const component = new Component();
        const isExistingChildElSpy = jest.spyOn(component, 'isExistingChildEl');

        await component.ButtonElExists;

        expect(isExistingChildElSpy).toHaveBeenCalledWith(Selectors.Button);
    });
});
