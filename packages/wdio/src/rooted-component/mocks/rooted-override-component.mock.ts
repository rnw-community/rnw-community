import { getExtendedRootedComponent } from '../get-extended-rooted-component/get-extended-rooted-component';

import { RootedComponentSelectorsMock } from './rooted-component-selectors.mock';
import { RootedParentComponentMock } from './rooted-parent-component.mock';

export class RootedOverrideComponentMock extends getExtendedRootedComponent(
    RootedComponentSelectorsMock,
    RootedParentComponentMock
) {
    constructor() {
        super(RootedComponentSelectorsMock.CustomRoot);
    }
}
