import { mockDefaultConfig } from '../element.mock';

import { Component } from './component';

enum SelectorsEnum {
    Button = 'SelectorsEnum',
}

describe('Component', () => {
    it('should return wdio element by selector using getChildEl', async () => {
        expect.assertions(1);

        const component = new Component(mockDefaultConfig, SelectorsEnum);

        await component.getChildEl('test-selector');
        expect(mockDefaultConfig.elSelectorFn).toHaveBeenCalledWith('test-selector');
    });

    it('should return array of wdio elements by selector using getChildEls', async () => {
        expect.assertions(1);

        const component = new Component(mockDefaultConfig, SelectorsEnum);

        await component.getChildEls('test-selector');
        expect(mockDefaultConfig.elsSelectorFn).toHaveBeenCalledWith('test-selector');
    });

    it('should return nth wdio element by selector using getChildElByIdx', async () => {
        expect.assertions(1);

        const component = new Component(mockDefaultConfig, SelectorsEnum);

        await component.getChildElByIdx('test-selector', 1);
        expect(mockDefaultConfig.elsIndexSelectorFn).toHaveBeenCalledWith('test-selector', 1);
    });
});
