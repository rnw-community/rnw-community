import { RootedComponentSelectorsMock } from './rooted-component-selectors.mock.js';
import { RootedComponentMock } from './rooted-component.mock.js';

export class RootedExtendedComponentMock extends RootedComponentMock {
    constructor() {
        super(RootedComponentSelectorsMock.CustomRoot);
    }
}
