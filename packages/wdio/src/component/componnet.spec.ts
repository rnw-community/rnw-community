import { mockDefaultConfig } from '../element.mock';

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
});
