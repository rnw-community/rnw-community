import { mockElement } from '../../element.mock';

import { get$RootedComponent } from './get$-rooted-component';

jest.mock('../../../command', () => ({
    byIndex$$: jest.fn(() => Promise.resolve(mockElement)),
}));

// @ts-expect-error Test
// eslint-disable-next-line
global.$ = jest.fn(() => Promise.resolve(mockElement));
// @ts-expect-error Test
// eslint-disable-next-line jest/prefer-spy-on
global.$$ = jest.fn(() => Promise.resolve([mockElement]));

enum RootedSelectorsEnum {
    Button = 'Selectors.Button',
    Root = 'Selectors.Root',
}

class CustomRootedComponent extends get$RootedComponent(RootedSelectorsEnum) {}

describe('get$RootedComponent', () => {
    it('should get RootedComponent instance with selectors and $* selector functions', async () => {
        expect.assertions(3);

        const component = new CustomRootedComponent();

        await expect(component.Button.el()).resolves.toMatchObject(mockElement);
        await expect(component.Button.els()).resolves.toMatchObject([mockElement]);
        await expect(component.Button.byIdx(1)).resolves.toMatchObject(mockElement);
    });
});
