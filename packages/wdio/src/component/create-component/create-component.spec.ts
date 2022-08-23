import { mockElement } from '../element.mock';

import { createComponent } from './create-component';

enum Selectors {
    Button = 'Selectors.Button',
}

jest.mock('../../command', () => ({
    testID$: jest.fn(() => Promise.resolve(mockElement)),
    testID$$: jest.fn(() => Promise.resolve([mockElement])),
    testID$$Index: jest.fn(() => Promise.resolve(mockElement)),
}));

describe('create-component', () => {
    it('should create Component instance with selectors', async () => {
        expect.assertions(1);

        const component = createComponent(Selectors);

        await expect(component.Button.el()).resolves.toMatchObject(mockElement);
    });
});
