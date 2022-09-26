import { mockElement } from '../../element.mock';

import { get$Component } from './get$-component';

enum SelectorsEnum {
    Button = 'Selectors.Button',
}

class CustomComponent extends get$Component(SelectorsEnum) {}

describe('get$Component', () => {
    it('should get Component instance with selectors and $* selector functions', async () => {
        expect.assertions(3);

        const component = new CustomComponent();

        await expect(component.Button.el()).resolves.toMatchObject(mockElement);
        await expect(component.Button.els()).resolves.toMatchObject([mockElement]);
        await expect(component.Button.byIdx(1)).resolves.toMatchObject(mockElement);
    });
});
