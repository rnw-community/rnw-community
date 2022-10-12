import { getExtendedRootedComponent } from '../get-extended-rooted-component/get-extended-rooted-component';

import { RootedComponent$Mock } from './rooted-component$.mock';
import { RootedParentComponentSelectorsMock } from './rooted-parent-component-selectors.mock';

export class RootedExtendedComponent$Mock extends getExtendedRootedComponent(
    RootedParentComponentSelectorsMock,
    RootedComponent$Mock
) {
    constructor() {
        super(RootedParentComponentSelectorsMock.ParentRoot);
    }
}
