import { mockDefaultConfig, mockElement } from '../element.mock';

import { RootedComponent } from './rooted-component';

import type { ClickArgs, WaitForDisplayedArgs, WaitForEnabledArgs, WaitForExistArgs } from '../type';
import type { ChainablePromiseElement } from 'webdriverio';

enum Selectors {
    Button = 'Selectors.Button',
    Root = 'Selectors.Root',
}

// TODO: Can we call method on parent with proper types?
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const getRootElSpies = (parent: RootedComponent, method: keyof typeof mockElement) => {
    const getRootElSpy = jest.spyOn(parent, 'RootEl', 'get');
    const elementMethodSpy = jest.spyOn(mockElement, method);

    getRootElSpy.mockImplementation(() => Promise.resolve(mockElement as unknown as WebdriverIO.Element));

    return [getRootElSpy, elementMethodSpy];
};

// eslint-disable-next-line max-lines-per-function,max-statements
describe('RootedComponent', () => {
    it('should return wdio element by selector in Root element using getChildEl', async () => {
        expect.assertions(3);

        const rootedComponent = new RootedComponent(Selectors.Root, mockDefaultConfig);

        await expect(rootedComponent.getChildEl(Selectors.Button)).resolves.toMatchObject(mockElement);
        expect(mockDefaultConfig.elSelectorFn).toHaveBeenNthCalledWith(1, Selectors.Root);
        expect(mockDefaultConfig.elSelectorFn).toHaveBeenNthCalledWith(
            2,
            Selectors.Button,
            expect.objectContaining(mockElement)
        );
    });

    it('should return array of wdio elements in Root by selector using getChildEls', async () => {
        expect.assertions(3);

        const rootedComponent = new RootedComponent(Selectors.Root, mockDefaultConfig);

        await expect(rootedComponent.getChildEls(Selectors.Button)).resolves.toContain(mockElement);
        expect(mockDefaultConfig.elSelectorFn).toHaveBeenNthCalledWith(1, Selectors.Root);
        expect(mockDefaultConfig.elsSelectorFn).toHaveBeenNthCalledWith(
            1,
            Selectors.Button,
            expect.objectContaining(mockElement)
        );
    });

    it('should return nth wdio element in Root by selector using getChildElByIdx', async () => {
        expect.assertions(3);

        const rootedComponent = new RootedComponent(Selectors.Root, mockDefaultConfig);

        await expect(rootedComponent.getChildElByIdx(Selectors.Button, 1)).resolves.toMatchObject(mockElement);
        expect(mockDefaultConfig.elSelectorFn).toHaveBeenNthCalledWith(1, Selectors.Root);
        expect(mockDefaultConfig.elsIndexSelectorFn).toHaveBeenNthCalledWith(
            1,
            Selectors.Button,
            1,
            expect.objectContaining(mockElement)
        );
    });

    it('should return Root wdio element by constructor selector', async () => {
        expect.assertions(2);

        const rootedComponent = new RootedComponent(Selectors.Root, mockDefaultConfig);

        await expect(rootedComponent.RootEl).resolves.toMatchObject(mockElement);
        expect(mockDefaultConfig.elSelectorFn).toHaveBeenNthCalledWith(1, Selectors.Root);
    });

    it('should return Root wdio element from constructor wdio element', async () => {
        expect.assertions(1);

        const rootEl = { ...mockElement, iamRoot: true };
        const rootedComponent = new RootedComponent(rootEl as unknown as WebdriverIO.Element, mockDefaultConfig);

        await expect(rootedComponent.RootEl).resolves.toBe(rootEl);
    });

    it('should return Root wdio element from constructor ChainablePromiseElement wdio element', () => {
        expect.assertions(1);

        const rootEl = Promise.resolve({ ...mockElement, iamRoot: true });
        const rootedComponent = new RootedComponent(
            rootEl as unknown as ChainablePromiseElement<WebdriverIO.Element>,
            mockDefaultConfig
        );

        expect(rootedComponent.RootEl).toBe(rootEl);
    });

    it('should click Root wdio element using click', async () => {
        expect.assertions(2);

        const rootedComponent = new RootedComponent(Selectors.Root, mockDefaultConfig);

        const [getRootElSpy, elementMethodSpy] = getRootElSpies(rootedComponent, 'click');

        const args: ClickArgs = [{ button: 1 }];
        await rootedComponent.click(...args);

        expect(getRootElSpy).toHaveBeenCalledWith();
        expect(elementMethodSpy).toHaveBeenCalledWith(...args);
    });

    it('should get Root wdio element displayed status using isDisplayed', async () => {
        expect.assertions(3);

        const rootedComponent = new RootedComponent(Selectors.Root, mockDefaultConfig);

        const [getRootElSpy, elementMethodSpy] = getRootElSpies(rootedComponent, 'isDisplayed');

        await expect(rootedComponent.isDisplayed()).resolves.toBe(true);
        expect(getRootElSpy).toHaveBeenCalledWith();
        expect(elementMethodSpy).toHaveBeenCalledWith();
    });

    it('should get Root wdio element existing status using isExisting', async () => {
        expect.assertions(3);

        const rootedComponent = new RootedComponent(Selectors.Root, mockDefaultConfig);

        const [getRootElSpy, elementMethodSpy] = getRootElSpies(rootedComponent, 'isExisting');

        await expect(rootedComponent.isExisting()).resolves.toBe(true);
        expect(getRootElSpy).toHaveBeenCalledWith();
        expect(elementMethodSpy).toHaveBeenCalledWith();
    });

    it('should wait for Root wdio element to be displayed using waitForDisplayed', async () => {
        expect.assertions(2);

        const rootedComponent = new RootedComponent(Selectors.Root, mockDefaultConfig);

        const [getRootElSpy, elementMethodSpy] = getRootElSpies(rootedComponent, 'waitForDisplayed');

        const args: WaitForDisplayedArgs = [{ reverse: true }];
        await rootedComponent.waitForDisplayed(...args);

        expect(getRootElSpy).toHaveBeenCalledWith();
        expect(elementMethodSpy).toHaveBeenCalledWith(...args);
    });

    it('should wait for Root wdio element to exist using waitForExist', async () => {
        expect.assertions(2);

        const rootedComponent = new RootedComponent(Selectors.Root, mockDefaultConfig);

        const [getRootElSpy, elementMethodSpy] = getRootElSpies(rootedComponent, 'waitForExist');

        const args: WaitForExistArgs = [{ reverse: true }];
        await rootedComponent.waitForExist(...args);

        expect(getRootElSpy).toHaveBeenCalledWith();
        expect(elementMethodSpy).toHaveBeenCalledWith(...args);
    });

    it('should wait for Root wdio element to be enabled using waitForEnabled', async () => {
        expect.assertions(2);

        const rootedComponent = new RootedComponent(Selectors.Root, mockDefaultConfig);

        const [getRootElSpy, elementMethodSpy] = getRootElSpies(rootedComponent, 'waitForEnabled');

        const args: WaitForEnabledArgs = [{ reverse: true }];
        await rootedComponent.waitForEnabled(...args);

        expect(getRootElSpy).toHaveBeenCalledWith();
        expect(elementMethodSpy).toHaveBeenCalledWith(...args);
    });
});
