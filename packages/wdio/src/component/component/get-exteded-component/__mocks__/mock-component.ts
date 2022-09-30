import { getExtendedComponent } from '../get-extended-component';

import { MockComponentSelectors } from './mock-component.selectors';
import { MockParentComponent } from './mock-parent-component';

export class MockComponent extends getExtendedComponent(MockComponentSelectors, MockParentComponent) {}
