import { describe, expect, it, jest } from '@jest/globals';

import { MockElementPromise, mockDefaultConfig, mockElement } from '../element.mock';
import { SelectorElement } from '../selector-element/selector-element';

import { RootedComponentSelectorsMock } from './mocks/rooted-component-selectors.mock';
import { RootedComponent } from './rooted-component';

import type { ChainablePromiseElement } from 'webdriverio';

describe('RootedComponent', () => {
    it('should return wdio element by selector in Root element using getChildEl', async () => {
        expect.assertions(3);

        const rootedComponent = new RootedComponent(
            mockDefaultConfig,
            RootedComponentSelectorsMock,
            RootedComponentSelectorsMock.Root
        );

        await expect(rootedComponent.getChildEl(RootedComponentSelectorsMock.Button)).resolves.toBe(mockElement);
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

    it('should get wdio element by index through the Root by selector using getChildElsByIndex', async () => {
        expect.assertions(3);

        const rootedComponent = new RootedComponent(
            mockDefaultConfig,
            RootedComponentSelectorsMock,
            RootedComponentSelectorsMock.Root
        );

        await expect(rootedComponent.getChildElByIdx(RootedComponentSelectorsMock.Button, 1)).resolves.toBe(mockElement);
        expect(mockDefaultConfig.elSelectorFn).toHaveBeenNthCalledWith(1, RootedComponentSelectorsMock.Root);
        expect(mockDefaultConfig.elsIndexSelectorFn).toHaveBeenNthCalledWith(
            1,
            RootedComponentSelectorsMock.Button,
            1,
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

        await expect(rootedComponent.RootEl).resolves.toBe(mockElement);
        expect(mockDefaultConfig.elSelectorFn).toHaveBeenNthCalledWith(1, RootedComponentSelectorsMock.Root);
    });

    it('should throw error if ChainablePromiseElement/Promise is passed as Root', () => {
        expect.assertions(1);

        expect(
            // @ts-expect-error runtime guard rejects Promise root
            () => new RootedComponent(mockDefaultConfig, RootedComponentSelectorsMock, Promise.resolve(mockElement))
        ).toThrow('Cannot create RootedComponent from ChainablePromiseElement, use string selector or Element');
    });

    it('should throw error if SelectorElement was passed as Root', () => {
        expect.assertions(1);

        // @ts-expect-error runtime guard rejects SelectorElement root
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

        const el = MockElementPromise.resolve(mockElement) as unknown as ChainablePromiseElement;
        const elementMethodSpy = jest.spyOn(el, 'click');

        const getRootElSpy = jest.spyOn(rootedComponent, 'RootEl', 'get');
        getRootElSpy.mockImplementation(() => el);

        const args = [{ button: 1 }];
        // @ts-expect-error proxy resolves fields dynamically
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

    it('throws a TypeError when the rooted component accesses a method missing from both selectors and the root element', () => {
        expect.assertions(1);

        const component = new RootedComponent(
            mockDefaultConfig,
            RootedComponentSelectorsMock,
            RootedComponentSelectorsMock.Root
        );

        // @ts-expect-error property does not exist on selectors
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        expect(() => void component.IDONOTEXISTS()).toThrow(TypeError);
    });
});
