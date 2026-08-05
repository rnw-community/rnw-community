import { describe, expect, it } from '@jest/globals';

import { mockElement } from '../../element.mock.js';
import { ComponentSelectorsMock } from '../mocks/component-selectors.mock.js';

import { createComponent } from './create-component.js';

describe('createComponent', () => {
    it('should create Component instance with selectors', async () => {
        expect.assertions(1);

        const component = createComponent(ComponentSelectorsMock);

        await expect(component.Button.el()).resolves.toBe(mockElement);
    });
});
