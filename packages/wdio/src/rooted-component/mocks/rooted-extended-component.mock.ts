import { RootedComponentSelectorsMock } from './rooted-component-selectors.mock';
import { RootedComponentMock } from './rooted-component.mock';

export class RootedExtendedComponentMock extends RootedComponentMock {
    constructor() {
        super(RootedComponentSelectorsMock.CustomRoot);
    }
}
