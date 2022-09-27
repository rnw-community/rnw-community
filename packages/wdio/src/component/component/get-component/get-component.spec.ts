import { expectTypeOf } from 'expect-type';

import { mockDefaultConfig, mockElement } from '../../element.mock';

import { getComponent } from './get-component';

enum SelectorsEnum {
    Button = 'Selectors.Button',
}

class CustomComponent extends getComponent(SelectorsEnum) {}

describe('getComponent', () => {
    it('should get selector methods from parent class', async () => {
        expect.assertions(2);

        const component = new CustomComponent();

        expectTypeOf(component.Button.el).toBeFunction();
        await expect(component.Button.el()).resolves.toMatchObject(mockElement);
        expect(mockDefaultConfig.elSelectorFn).toHaveBeenCalledWith(SelectorsEnum.Button);
    });
});
