import { describe, expect, it } from '@jest/globals';

import { mockElement } from '../../element.mock.js';
import { RootedComponentSelectorsMock } from '../../rooted-component/mocks/rooted-component-selectors.mock.js';

import { createRootedComponent$ } from './create-rooted-component$.js';

describe('createRootedComponent$', () => {
    it('should create RootedComponent instance with selectors and $* selector functions', async () => {
        expect.assertions(3);

        const component = createRootedComponent$(RootedComponentSelectorsMock, RootedComponentSelectorsMock.Root);

        await expect(component.Button.el()).resolves.toStrictEqual(mockElement);
        await expect(component.Button.els()).resolves.toStrictEqual([mockElement]);
        await expect(component.Button.byIdx(1)).resolves.toStrictEqual(mockElement);
    });
});
