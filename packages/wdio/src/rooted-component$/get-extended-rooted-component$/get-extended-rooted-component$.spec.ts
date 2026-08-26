import { describe, expect, it, jest } from '@jest/globals';

import { mockDefault$Config, mockElement } from '../../element.mock';
import { DefaultRootRootedExtendedComponent$Mock } from '../mocks/default-root-rooted-extended-component$.mock';
import { RootedComponent$SelectorsMock } from '../mocks/rooted-component$-selectors.mock';
import { RootedComponent$Mock } from '../mocks/rooted-component$.mock';

describe('getExtendedRootedComponent$', () => {
    it('resolves RootEl to the root element found by the Root$ chainable selector', async () => {
        expect.assertions(2);

        const component = new RootedComponent$Mock(RootedComponent$SelectorsMock.Root$);

        await expect(component.RootEl).resolves.toBe(mockElement);
        expect(mockDefault$Config.elSelectorFn).toHaveBeenNthCalledWith(1, RootedComponent$SelectorsMock.Root$);

        jest.clearAllMocks();
    });

    it('falls back to the Root$ selector from the selectors enum when the extended $ class passes no root argument', async () => {
        expect.assertions(1);

        const component = new DefaultRootRootedExtendedComponent$Mock();
        await component.waitForDisplayed({ reverse: true });

        expect(mockDefault$Config.elSelectorFn).toHaveBeenNthCalledWith(1, RootedComponent$SelectorsMock.Root$);
    });
});
