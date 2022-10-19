import { mockDefaultConfig, mockElement } from '../../element.mock';
import { DefaultRootRootedExtendedComponentMock } from '../mocks/default-root-rooted-extended-component.mock';
import { RootedComponentSelectorsMock } from '../mocks/rooted-component-selectors.mock';
import { RootedComponentMock } from '../mocks/rooted-component.mock';
import { RootedExtendedComponentMock } from '../mocks/rooted-extended-component.mock';
import { RootedOverrideComponentMock } from '../mocks/rooted-override-component.mock';
import { RootedParentComponentSelectorsMock } from '../mocks/rooted-parent-component-selectors.mock';

// eslint-disable-next-line max-lines-per-function
describe('getExtendedRootedComponent', () => {
    it('should return RootEl using getter', async () => {
        expect.assertions(2);

        const component = new RootedComponentMock(RootedComponentSelectorsMock.Root);

        await expect(component.RootEl).resolves.toBe(mockElement);
        expect(mockDefaultConfig.elSelectorFn).toHaveBeenNthCalledWith(1, RootedComponentSelectorsMock.Root);

        jest.clearAllMocks();
    });

    it('should call parent RootedComponent methods', async () => {
        expect.assertions(4);

        const component = new RootedComponentMock(RootedComponentSelectorsMock.Root);

        await component.Button.el();
        expect(mockDefaultConfig.elSelectorFn).toHaveBeenNthCalledWith(1, RootedComponentSelectorsMock.Root);
        expect(mockDefaultConfig.elSelectorFn).toHaveBeenNthCalledWith(
            2,
            RootedComponentSelectorsMock.Button,
            expect.objectContaining({})
        );

        await component.ParentButton.el();
        expect(mockDefaultConfig.elSelectorFn).toHaveBeenNthCalledWith(3, RootedComponentSelectorsMock.Root);
        expect(mockDefaultConfig.elSelectorFn).toHaveBeenNthCalledWith(
            4,
            RootedParentComponentSelectorsMock.ParentButton,
            expect.objectContaining({})
        );
    });

    it('should use correct "latest" root selector from overloaded constructor in all parents chain', async () => {
        expect.assertions(2);

        const component = new RootedOverrideComponentMock();

        await component.RootEl;
        expect(mockDefaultConfig.elSelectorFn).toHaveBeenCalledWith(RootedComponentSelectorsMock.CustomRoot);

        await component.ParentButton.el();
        expect(mockDefaultConfig.elSelectorFn).toHaveBeenCalledWith(
            RootedParentComponentSelectorsMock.ParentButton,
            expect.objectContaining({})
        );
    });

    it('should have all wdio element methods accessible on RootEl', async () => {
        expect.assertions(1);

        const component = new RootedComponentMock(RootedComponentSelectorsMock.Root);

        await component.waitForDisplayed({ reverse: true });
        expect(mockDefaultConfig.elSelectorFn).toHaveBeenCalledWith(RootedComponentSelectorsMock.CustomRoot);
    });

    it('should call extended class methods and change class state', () => {
        expect.assertions(2);

        const component = new RootedExtendedComponentMock();

        const testData = 'test-data';
        component.setTestData(testData);
        expect(component.getTestData()).toBe(testData);

        const parentTestData = 'parent-test-data';
        component.setParentData(parentTestData);
        expect(component.getParentData()).toBe(parentTestData);
    });

    it('should call extended class getters/setters and change class state', () => {
        expect.assertions(2);

        const Ctor = RootedExtendedComponentMock;
        const component = new Ctor();

        const testData = 'test-data-1';
        component.TestData = testData;
        expect(component.TestData).toBe(testData);

        const parentTestData = 'test-data-2';
        component.ParentData = parentTestData;
        expect(component.ParentData).toBe(parentTestData);
    });

    it('should use override constructor selectorOrElement arg as RootEl', async () => {
        expect.assertions(2);

        const component = new RootedExtendedComponentMock();

        await expect(component.Button.el()).resolves.toBe(mockElement);
        expect(mockDefaultConfig.elSelectorFn).toHaveBeenCalledWith(RootedComponentSelectorsMock.CustomRoot);
    });

    it('should return component from async functions', async () => {
        expect.assertions(2);

        const asyncFn = async (): Promise<RootedExtendedComponentMock> => {
            const component = new RootedExtendedComponentMock();

            await expect(component.Button.el()).resolves.toBe(mockElement);

            return component;
        };

        const awaitedComponent = await asyncFn();

        await expect(awaitedComponent.Button.el()).resolves.toBe(mockElement);
    });

    it('can have default root selector from the selectors enum', async () => {
        expect.assertions(1);

        const component = new DefaultRootRootedExtendedComponentMock();
        await component.waitForDisplayed({ reverse: true });
        expect(mockDefaultConfig.elSelectorFn).toHaveBeenCalledWith(RootedComponentSelectorsMock.CustomRoot);
    });
});
