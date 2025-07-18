import { describe, expect, it, jest } from '@jest/globals';

import { mockDefaultConfig } from '../element.mock';

import { Component } from './component';
import { ComponentSelectorsMock } from './mocks/component-selectors.mock';

describe('Component', () => {
    it('should return wdio element by selector using getChildEl', () => {
        expect.assertions(1);

        const component = new Component(mockDefaultConfig, ComponentSelectorsMock);

        component.getChildEl('test-selector');

        expect(mockDefaultConfig.elSelectorFn).toHaveBeenCalledWith('test-selector');
    });

    it('should return array of wdio elements by selector using getChildEls', () => {
        expect.assertions(1);

        const component = new Component(mockDefaultConfig, ComponentSelectorsMock);

        component.getChildEls('test-selector');

        expect(mockDefaultConfig.elsSelectorFn).toHaveBeenCalledWith('test-selector');
    });

    it('should find component from array of elements by using getComponentFromEls', async () => {
        expect.assertions(1);

        const component = new Component(mockDefaultConfig, ComponentSelectorsMock);

        const componentFn = jest.fn<(el: WebdriverIO.Element) => Promise<Component>>();
        const predicateFn = jest.fn<(component: Component) => Promise<boolean>>();

        componentFn.mockResolvedValue(component);
        predicateFn.mockResolvedValue(true);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const result = await component.getComponentFromEls(ComponentSelectorsMock.Button, componentFn, predicateFn);

        expect(result).toBe(component);
    });

    it('should find component from array of elements by using getComponentFromEls with index', async () => {
        expect.assertions(1);

        const component = new Component(mockDefaultConfig, ComponentSelectorsMock);

        const componentFn = jest.fn<(el: WebdriverIO.Element) => Promise<Component>>();
        const predicateFn = jest.fn<(component: Component, idx: number) => Promise<boolean>>();

        componentFn.mockResolvedValue(component);
        predicateFn.mockResolvedValue(true);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const result = await component.getComponentFromEls(ComponentSelectorsMock.Button, componentFn, predicateFn);

        expect(result).toBe(component);
    });

    it('should throw error component is not found using getComponentFromEls', async () => {
        expect.assertions(1);

        const component = new Component(mockDefaultConfig, ComponentSelectorsMock);

        const componentFn = jest.fn<(el: WebdriverIO.Element) => Promise<Component>>();
        const predicateFn = jest.fn<(component: Component) => Promise<boolean>>();

        componentFn.mockResolvedValue(component);
        predicateFn.mockResolvedValue(false);

        await expect(component.getComponentFromEls(ComponentSelectorsMock.Button, componentFn, predicateFn)).rejects.toThrow(
            `Failed finding component from elements array "${ComponentSelectorsMock.Button}"`
        );
    });
});
