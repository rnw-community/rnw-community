import { describe, expect, it, jest } from '@jest/globals';

import { mockDefault$Config, mockElement } from '../../element.mock.js';
import { DefaultRootRootedExtendedComponent$Mock } from '../mocks/default-root-rooted-extended-component$.mock.js';
import { RootedComponent$SelectorsMock } from '../mocks/rooted-component$-selectors.mock.js';
import { RootedComponent$Mock } from '../mocks/rooted-component$.mock.js';

describe('getExtendedRootedComponent$', () => {
    it('should return RootEl using getter', async () => {
        expect.assertions(2);

        const component = new RootedComponent$Mock(RootedComponent$SelectorsMock.Root$);

        await expect(component.RootEl).resolves.toBe(mockElement);
        expect(mockDefault$Config.elSelectorFn).toHaveBeenNthCalledWith(1, RootedComponent$SelectorsMock.Root$);

        jest.clearAllMocks();
    });

    it('can have default root selector from the selectors enum', async () => {
        expect.assertions(1);

        const component = new DefaultRootRootedExtendedComponent$Mock();
        await component.waitForDisplayed({ reverse: true });

        expect(mockDefault$Config.elSelectorFn).toHaveBeenNthCalledWith(1, RootedComponent$SelectorsMock.Root$);
    });
});
