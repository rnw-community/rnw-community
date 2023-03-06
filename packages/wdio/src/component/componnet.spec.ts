import { mockDefaultConfig, mockElement } from '../element.mock';

import { Component } from './component';
import { ComponentSelectorsMock } from './mocks/component-selectors.mock';

describe('Component', () => {
    it('should return wdio element by selector using getChildEl', async () => {
        expect.assertions(1);

        const component = new Component(mockDefaultConfig, ComponentSelectorsMock);

        await component.getChildEl('test-selector');
        expect(mockDefaultConfig.elSelectorFn).toHaveBeenCalledWith('test-selector');
    });

    it('should return array of wdio elements by selector using getChildEls', async () => {
        expect.assertions(1);

        const component = new Component(mockDefaultConfig, ComponentSelectorsMock);

        await component.getChildEls('test-selector');
        expect(mockDefaultConfig.elsSelectorFn).toHaveBeenCalledWith('test-selector');
    });

    it('should find component from array of elements by using getComponentFromEls', async () => {
        expect.assertions(1);

        const component = new Component(mockDefaultConfig, ComponentSelectorsMock);

        const componentFn = jest.fn();
        const predicateFn = jest.fn();

        componentFn.mockResolvedValue(mockElement);
        predicateFn.mockImplementation(() => true);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const result = await component.getComponentFromEls(ComponentSelectorsMock.Button, componentFn, predicateFn);

        expect(result).toBe(mockElement);
    });

    it('should throw error component is not found using getComponentFromEls', async () => {
        expect.assertions(1);

        const component = new Component(mockDefaultConfig, ComponentSelectorsMock);

        const componentFn = jest.fn();
        const predicateFn = jest.fn();

        componentFn.mockResolvedValue(mockElement);
        predicateFn.mockImplementation(() => false);

        await expect(component.getComponentFromEls(ComponentSelectorsMock.Button, componentFn, predicateFn)).rejects.toThrow(
            `Failed finding component from elements array "${ComponentSelectorsMock.Button}"`
        );
    });
});
