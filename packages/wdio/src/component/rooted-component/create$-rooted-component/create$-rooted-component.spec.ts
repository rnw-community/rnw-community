import { mockElement } from '../../element.mock';

import { create$RootedComponent } from './create$-rooted-component';

enum Selectors {
    Button = 'Selectors.Button',
    Root = 'Selectors.Root',
}

describe('create$-rooted-component', () => {
    it('should create RootedComponent instance with selectors and $* selector functions', async () => {
        expect.assertions(3);

        const component = create$RootedComponent(Selectors);

        await expect(component.Button.el()).resolves.toMatchObject(mockElement);
        await expect(component.Button.els()).resolves.toMatchObject([mockElement]);
        await expect(component.Button.byIdx(1)).resolves.toMatchObject(mockElement);
    });
});
