import { testID$ } from '../../../command';
import { mockElement } from '../../element.mock';

import { getRootedComponent } from './get-rooted-component';

enum RootedSelectorsEnum {
    Button = 'Selectors.Button',
    Root = 'Selectors.Root',
}

class RootedComponent extends getRootedComponent(RootedSelectorsEnum) {}

jest.mock('../../../command', () => ({
    testID$: jest.fn(() => Promise.resolve(mockElement)),
    testID$$: jest.fn(() => Promise.resolve([mockElement])),
    testID$$Index: jest.fn(() => Promise.resolve(mockElement)),
}));

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

        expect(testID$).toHaveBeenNthCalledWith(1, RootedSelectorsEnum.Root);
        expect(testID$).toHaveBeenNthCalledWith(2, RootedSelectorsEnum.Button, expect.objectContaining({}));
    });

    it('should call parent RootedComponent methods', async () => {
        expect.assertions(1);

        const component = new RootedComponent();

        await component.RootEl;

        expect(testID$).toHaveBeenNthCalledWith(1, RootedSelectorsEnum.Root);
    });
});
