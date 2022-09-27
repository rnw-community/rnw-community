import { mockDefaultConfig } from '../../element.mock';

import { getRootedComponent } from './get-rooted-component';

enum RootedSelectorsEnum {
    Button = 'Selectors.Button',
    Root = 'Selectors.Root',
}

class RootedComponent extends getRootedComponent(RootedSelectorsEnum) {}

describe('getRootedComponent', () => {
    it('should call parent RootedComponent methods', async () => {
        expect.assertions(1);

        const component = new RootedComponent();

        await component.RootEl;

        expect(mockDefaultConfig.elSelectorFn).toHaveBeenNthCalledWith(1, RootedSelectorsEnum.Root);
    });
});
