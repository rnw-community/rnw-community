import { MockElement, mockDefaultConfig, mockElement } from '../element.mock';

import { RootedComponent } from './rooted-component';

import type { ChainablePromiseElement } from 'webdriverio';

enum Selectors {
    Button = 'Selectors.Button',
    Root = 'Selectors.Root',
}

const fakeRootEl = { ...mockElement, iamRoot: true } as unknown as WebdriverIO.Element;

// eslint-disable-next-line max-lines-per-function,max-statements
describe('RootedComponent', () => {
    it('should return wdio element by selector in Root element using getChildEl', async () => {
        expect.assertions(3);

        const rootedComponent = new RootedComponent(mockDefaultConfig, Selectors, Selectors.Root);

        await expect(rootedComponent.getChildEl(Selectors.Button)).resolves.toMatchObject(mockElement);
        expect(mockDefaultConfig.elSelectorFn).toHaveBeenNthCalledWith(1, Selectors.Root);
        expect(mockDefaultConfig.elSelectorFn).toHaveBeenNthCalledWith(2, Selectors.Button, expect.objectContaining({}));
    });

    it('should return array of wdio elements in Root by selector using getChildEls', async () => {
        expect.assertions(3);

        const rootedComponent = new RootedComponent(mockDefaultConfig, Selectors, Selectors.Root);

        await expect(rootedComponent.getChildEls(Selectors.Button)).resolves.toContain(mockElement);
        expect(mockDefaultConfig.elSelectorFn).toHaveBeenNthCalledWith(1, Selectors.Root);
        expect(mockDefaultConfig.elsSelectorFn).toHaveBeenNthCalledWith(1, Selectors.Button, expect.objectContaining({}));
    });

    it('should return nth wdio element in Root by selector using getChildElByIdx', async () => {
        expect.assertions(3);

        const rootedComponent = new RootedComponent(mockDefaultConfig, Selectors, Selectors.Root);

        await expect(rootedComponent.getChildElByIdx(Selectors.Button, 1)).resolves.toMatchObject(mockElement);
        expect(mockDefaultConfig.elSelectorFn).toHaveBeenNthCalledWith(1, Selectors.Root);
        expect(mockDefaultConfig.elsIndexSelectorFn).toHaveBeenNthCalledWith(
            1,
            Selectors.Button,
            1,
            expect.objectContaining({})
        );
    });

    it('should return Root wdio element by constructor selector', async () => {
        expect.assertions(2);

        const rootedComponent = new RootedComponent(mockDefaultConfig, Selectors, Selectors.Root);

        await expect(rootedComponent.RootEl).resolves.toMatchObject(mockElement);
        expect(mockDefaultConfig.elSelectorFn).toHaveBeenNthCalledWith(1, Selectors.Root);
    });

    it('should create Root wdio element chain from constructor wdio element', async () => {
        expect.assertions(1);

        const rootedComponent = new RootedComponent(mockDefaultConfig, Selectors, fakeRootEl);

        await expect(rootedComponent.RootEl).resolves.toMatchObject(mockElement);
    });

    it('should return Root wdio element from constructor ChainablePromiseElement wdio element', () => {
        expect.assertions(1);

        const rootEl = Promise.resolve(fakeRootEl) as ChainablePromiseElement<WebdriverIO.Element>;
        const rootedComponent = new RootedComponent(mockDefaultConfig, Selectors, rootEl);

        expect(rootedComponent.RootEl).toBe(rootEl);
    });

    it('should call WDIO element method on Root element', async () => {
        expect.assertions(2);

        const rootedComponent = new RootedComponent(mockDefaultConfig, Selectors, Selectors.Root);

        const el = MockElement.resolve(mockElement) as ChainablePromiseElement<WebdriverIO.Element>;

        const getRootElSpy = jest.spyOn(rootedComponent, 'RootEl', 'get');
        getRootElSpy.mockImplementation(() => el);

        const elementMethodSpy = jest.spyOn(el, 'click');

        const args = [{ button: 1 }];
        // @ts-expect-error Proxy test
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        await rootedComponent.click(...args);

        expect(getRootElSpy).toHaveBeenCalledWith();
        expect(elementMethodSpy).toHaveBeenCalledWith(...args);
    });

    it('should throw an error if no root selector is passed nor Root enum key exists', () => {
        expect.assertions(1);

        enum SelectorsWithoutRootEnum {
            Button = 'Selectors.Button',
        }

        expect(() => new RootedComponent(mockDefaultConfig, SelectorsWithoutRootEnum)).toThrow(
            'Cannot create RootedComponent - Neither root selector nor root element is passed'
        );
    });

    it('should use Root enum selector as Component RootEl', async () => {
        expect.assertions(2);

        const component = new RootedComponent(mockDefaultConfig, Selectors);

        await component.getChildEl(Selectors.Button);

        expect(mockDefaultConfig.elSelectorFn).toHaveBeenNthCalledWith(1, Selectors.Root);
        expect(mockDefaultConfig.elSelectorFn).toHaveBeenNthCalledWith(2, Selectors.Button, expect.objectContaining({}));
    });

    it('should throw error on accessing not existing selector element/wdio element property', () => {
        expect.assertions(1);

        const component = new RootedComponent(mockDefaultConfig, Selectors);

        // @ts-expect-error Test
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        expect(() => void component.IDONOTEXISTS()).toThrow(TypeError);
    });
});
