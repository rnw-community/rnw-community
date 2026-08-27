import { describe, expect, it } from '@jest/globals';

import { mockDefaultConfig } from '../../element.mock';
import { DefaultRootRootedComponentMock } from '../mocks/default-root-rooted-component.mock';
import { RootedComponentSelectorsMock } from '../mocks/rooted-component-selectors.mock';
import { RootedComponentMock } from '../mocks/rooted-component.mock';

describe('getRootedComponent', () => {
    it('exposes inherited RootedComponent element methods on getRootedComponent instances', async () => {
        expect.assertions(1);

        const component = new RootedComponentMock(RootedComponentSelectorsMock.Root);

        await component.RootEl.waitForDisplayed();

        expect(mockDefaultConfig.elSelectorFn).toHaveBeenNthCalledWith(1, RootedComponentSelectorsMock.Root);
    });

    it('falls back to the Root selector from the selectors enum when getRootedComponent gets no root argument', async () => {
        expect.assertions(1);

        const component = new DefaultRootRootedComponentMock();
        await component.waitForDisplayed({ reverse: true });

        expect(mockDefaultConfig.elSelectorFn).toHaveBeenCalledWith(RootedComponentSelectorsMock.Root);
    });
});
