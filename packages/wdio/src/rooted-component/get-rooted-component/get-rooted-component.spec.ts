import { describe, expect, it } from '@jest/globals';

import { mockDefaultConfig } from '../../element.mock.js';
import { DefaultRootRootedComponentMock } from '../mocks/default-root-rooted-component.mock.js';
import { RootedComponentSelectorsMock } from '../mocks/rooted-component-selectors.mock.js';
import { RootedComponentMock } from '../mocks/rooted-component.mock.js';

describe('getRootedComponent', () => {
    it('should call parent RootedComponent methods', async () => {
        expect.assertions(1);

        const component = new RootedComponentMock(RootedComponentSelectorsMock.Root);

        await component.RootEl.waitForDisplayed();

        expect(mockDefaultConfig.elSelectorFn).toHaveBeenNthCalledWith(1, RootedComponentSelectorsMock.Root);
    });

    it('can have default root selector from the selectors enum', async () => {
        expect.assertions(1);

        const component = new DefaultRootRootedComponentMock();
        await component.waitForDisplayed({ reverse: true });

        expect(mockDefaultConfig.elSelectorFn).toHaveBeenCalledWith(RootedComponentSelectorsMock.Root);
    });
});
