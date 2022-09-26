import { mockElement } from '../../element.mock';

import { create$Component } from './create$-component';

jest.mock('../../../command', () => ({
    byIndex$$: jest.fn(() => Promise.resolve(mockElement)),
}));

// @ts-expect-error Test
// eslint-disable-next-line
global.$ = jest.fn(() => Promise.resolve(mockElement));
// @ts-expect-error Test
// eslint-disable-next-line jest/prefer-spy-on
global.$$ = jest.fn(() => Promise.resolve([mockElement]));

enum Selectors {
    Button = 'Selectors.Button',
}

describe('create$-component', () => {
    it('should create Component instance with selectors and $* selector functions', async () => {
        expect.assertions(3);

        const component = create$Component(Selectors);

        await expect(component.Button.el()).resolves.toMatchObject(mockElement);
        await expect(component.Button.els()).resolves.toMatchObject([mockElement]);
        await expect(component.Button.byIdx(1)).resolves.toMatchObject(mockElement);
    });
});
