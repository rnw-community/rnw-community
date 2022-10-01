import { getExtendedRootedComponent } from '../rooted-component/get-extended-rooted-component/get-extended-rooted-component';

import { RootedComponentSelectorsMock } from './rooted-component-selectors.mock';
import { RootedParentComponentMock } from './rooted-parent-component.mock';

export class RootedComponentMock extends getExtendedRootedComponent(
    RootedComponentSelectorsMock,
    RootedParentComponentMock
) {
    constructor() {
        super(RootedComponentSelectorsMock.CustomRoot);
    }
}
