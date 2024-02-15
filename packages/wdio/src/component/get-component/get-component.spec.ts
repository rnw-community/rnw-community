import { describe, expect, it } from '@jest/globals';

import { mockDefaultConfig, mockElement } from '../../element.mock';
import { ComponentSelectorsMock } from '../mocks/component-selectors.mock';
import { GetComponentMock } from '../mocks/get-component.mock';

describe('getComponent', () => {
    it('should get selector methods from parent class', async () => {
        expect.assertions(2);

        const component = new GetComponentMock();

        await expect(component.Button.el()).resolves.toBe(mockElement);
        expect(mockDefaultConfig.elSelectorFn).toHaveBeenCalledWith(ComponentSelectorsMock.Button);
    });
});
