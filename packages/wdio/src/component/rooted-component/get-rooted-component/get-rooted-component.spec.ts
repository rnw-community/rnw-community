import { mockDefaultConfig } from '../../element.mock';

import { getRootedComponent } from './get-rooted-component';

enum RootedSelectorsEnum {
    Button = 'Selectors.Button',
    Root = 'Selectors.Root',
}

class RootedComponent extends getRootedComponent(RootedSelectorsEnum) {}

describe('getRootedComponent', () => {
    it('should throw an error if no root selector is passed nor Root enum key exists', () => {
        expect.assertions(1);

        enum SelectorsWithoutRootEnum {
            Button = 'Selectors.Button',
        }

        expect(() => new (getRootedComponent(SelectorsWithoutRootEnum))()).toThrow(
            'Cannot create RootedComponent - Neither root selector nor root element is passed'
        );
    });

    it('should use Root enum selector as Component RootEl', async () => {
        expect.assertions(2);

        const component = new RootedComponent();

        await component.Button.el();

        expect(mockDefaultConfig.elSelectorFn).toHaveBeenNthCalledWith(1, RootedSelectorsEnum.Root);
        expect(mockDefaultConfig.elSelectorFn).toHaveBeenNthCalledWith(
            2,
            RootedSelectorsEnum.Button,
            expect.objectContaining({})
        );
    });

    it('should call parent RootedComponent methods', async () => {
        expect.assertions(1);

        const component = new RootedComponent();

        await component.RootEl;

        expect(mockDefaultConfig.elSelectorFn).toHaveBeenNthCalledWith(1, RootedSelectorsEnum.Root);
    });
});
