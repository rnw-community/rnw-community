import { mockElement } from '../../element.mock';
import { RootedComponentSelectorsMock } from '../mocks/rooted-component-selectors.mock';

import { create$RootedComponent } from './create$-rooted-component';

describe('create$-rooted-component', () => {
    it('should create RootedComponent instance with selectors and $* selector functions', async () => {
        expect.assertions(3);

        const component = create$RootedComponent(RootedComponentSelectorsMock);

        await expect(component.Button.el()).resolves.toMatchObject(mockElement);
        await expect(component.Button.els()).resolves.toMatchObject([mockElement]);
        await expect(component.Button.byIdx(1)).resolves.toMatchObject(mockElement);
    });
});
