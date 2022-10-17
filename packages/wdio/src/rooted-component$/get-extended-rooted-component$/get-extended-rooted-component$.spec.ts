import { mockDefault$Config, mockElement } from '../../element.mock';
import { RootedComponent$SelectorsMock } from '../mocks/rooted-component$-selectors.mock';
import { RootedComponent$Mock } from '../mocks/rooted-component$.mock';

describe('getExtendedRootedComponent$', () => {
    it('should return RootEl using getter', async () => {
        expect.assertions(2);

        const component = new RootedComponent$Mock(RootedComponent$SelectorsMock.Root$);

        await expect(component.RootEl).resolves.toBe(mockElement);
        expect(mockDefault$Config.elSelectorFn).toHaveBeenNthCalledWith(1, RootedComponent$SelectorsMock.Root$);

        jest.clearAllMocks();
    });
});
