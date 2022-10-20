import { MockElement, mockDefaultConfig, mockElement } from '../element.mock';
import { SelectorElement } from '../selector-element/selector-element';

import { RootedComponentSelectorsMock } from './mocks/rooted-component-selectors.mock';
import { RootedComponent } from './rooted-component';

import type { ChainablePromiseElement } from 'webdriverio';

// eslint-disable-next-line max-lines-per-function,max-statements
describe('RootedComponent', () => {
    it('should return wdio element by selector in Root element using getChildEl', async () => {
        expect.assertions(3);

        const rootedComponent = new RootedComponent(
            mockDefaultConfig,
            RootedComponentSelectorsMock,
            RootedComponentSelectorsMock.Root
        );

        await expect(rootedComponent.getChildEl(RootedComponentSelectorsMock.Button)).resolves.toMatchObject(mockElement);
        expect(mockDefaultConfig.elSelectorFn).toHaveBeenNthCalledWith(1, RootedComponentSelectorsMock.Root);
        expect(mockDefaultConfig.elSelectorFn).toHaveBeenNthCalledWith(
            2,
            RootedComponentSelectorsMock.Button,
            expect.objectContaining({})
        );
    });

    it('should return array of wdio elements in Root by selector using getChildEls', async () => {
        expect.assertions(3);

        const rootedComponent = new RootedComponent(
            mockDefaultConfig,
            RootedComponentSelectorsMock,
            RootedComponentSelectorsMock.Root
        );

        await expect(rootedComponent.getChildEls(RootedComponentSelectorsMock.Button)).resolves.toContain(mockElement);
        expect(mockDefaultConfig.elSelectorFn).toHaveBeenNthCalledWith(1, RootedComponentSelectorsMock.Root);
        expect(mockDefaultConfig.elsSelectorFn).toHaveBeenNthCalledWith(
            1,
            RootedComponentSelectorsMock.Button,
            expect.objectContaining({})
        );
    });

    it('should return Root wdio element by constructor selector', async () => {
        expect.assertions(2);

        const rootedComponent = new RootedComponent(
            mockDefaultConfig,
            RootedComponentSelectorsMock,
            RootedComponentSelectorsMock.Root
        );

        await expect(rootedComponent.RootEl).resolves.toMatchObject(mockElement);
        expect(mockDefaultConfig.elSelectorFn).toHaveBeenNthCalledWith(1, RootedComponentSelectorsMock.Root);
    });

    it('should throw error if ChainablePromiseElement/Promise is passed as Root', () => {
        expect.assertions(1);

        expect(
            // @ts-expect-error Runtime check
            () => new RootedComponent(mockDefaultConfig, RootedComponentSelectorsMock, Promise.resolve(mockElement))
        ).toThrow('Cannot create RootedComponent from ChainablePromiseElement, use string selector or WebdriverIO.Element');
    });

    it('should throw error if SelectorElement was passed as Root', () => {
        expect.assertions(1);

        // @ts-expect-error Runtime check
        expect(() => new RootedComponent(mockDefaultConfig, RootedComponentSelectorsMock, new SelectorElement())).toThrow(
            'Cannot create RootedComponent from SelectorElement, use .el()'
        );
    });

    it('should call WDIO element method on Root element', async () => {
        expect.assertions(2);

        const rootedComponent = new RootedComponent(
            mockDefaultConfig,
            RootedComponentSelectorsMock,
            RootedComponentSelectorsMock.Root
        );

        const el = MockElement.resolve(mockElement) as ChainablePromiseElement<WebdriverIO.Element>;
        const elementMethodSpy = jest.spyOn(el, 'click');

        const getRootElSpy = jest.spyOn(rootedComponent, 'RootEl', 'get');
        getRootElSpy.mockImplementation(() => el);

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

        expect(() => new RootedComponent(mockDefaultConfig, SelectorsWithoutRootEnum, undefined)).toThrow(
            'Cannot create RootedComponent - Neither root selector nor root element is passed'
        );
    });

    it('should throw error on accessing not existing selector element/wdio element property', () => {
        expect.assertions(1);

        const component = new RootedComponent(
            mockDefaultConfig,
            RootedComponentSelectorsMock,
            RootedComponentSelectorsMock.Root
        );

        // @ts-expect-error Test
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        expect(() => void component.IDONOTEXISTS()).toThrow(TypeError);
    });
});
