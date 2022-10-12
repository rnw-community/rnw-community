import { mockDefaultConfig } from '../../element.mock';
import { RootedComponentSelectorsMock } from '../mocks/rooted-component-selectors.mock';
import { RootedComponentMock } from '../mocks/rooted-component.mock';

describe('getRootedComponent', () => {
    it('should call parent RootedComponent methods', async () => {
        expect.assertions(1);

        const component = new RootedComponentMock();

        await component.RootEl;

        expect(mockDefaultConfig.elSelectorFn).toHaveBeenNthCalledWith(1, RootedComponentSelectorsMock.Root);
    });
});
