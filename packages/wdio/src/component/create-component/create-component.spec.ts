import { mockElement } from '../../element.mock';
import { ComponentSelectorsMock } from '../mocks/component-selectors.mock';

import { createComponent } from './create-component';

describe('createComponent', () => {
    it('should create Component instance with selectors', async () => {
        expect.assertions(1);

        const component = createComponent(ComponentSelectorsMock);

        await expect(component.Button.el()).resolves.toMatchObject(mockElement);
    });
});
