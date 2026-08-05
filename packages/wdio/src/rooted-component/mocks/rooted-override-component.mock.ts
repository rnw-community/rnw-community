import { getExtendedRootedComponent } from '../get-extended-rooted-component/get-extended-rooted-component.js';

import { RootedComponentSelectorsMock } from './rooted-component-selectors.mock.js';
import { RootedParentComponentMock } from './rooted-parent-component.mock.js';

export class RootedOverrideComponentMock extends getExtendedRootedComponent(
    RootedComponentSelectorsMock,
    RootedParentComponentMock
) {
    constructor() {
        super(RootedComponentSelectorsMock.CustomRoot);
    }
}
