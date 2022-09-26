import { mockElement } from '../../element.mock';

import { createComponent } from './create-component';

enum Selectors {
    Button = 'Selectors.Button',
}

describe('create-component', () => {
    it('should create Component instance with selectors', async () => {
        expect.assertions(1);

        const component = createComponent(Selectors);

        await expect(component.Button.el()).resolves.toMatchObject(mockElement);
    });
});
