import { getExtendedRootedComponent } from '../get-extended-rooted-component';

import { MockRootedComponentSelectors } from './mock-rooted-component.selectors';
import { MockRootedParentComponent } from './mock-rooted-parent-component';

export class MockRootedComponent extends getExtendedRootedComponent(
    MockRootedComponentSelectors,
    MockRootedParentComponent
) {
    constructor() {
        super(MockRootedComponentSelectors.CustomRoot);
    }
}
