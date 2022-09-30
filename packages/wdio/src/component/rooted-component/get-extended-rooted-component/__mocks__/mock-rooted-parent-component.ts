import { RootedComponent } from '../../rooted-component';
import { getExtendedRootedComponent } from '../get-extended-rooted-component';

import { MockRootedParentComponentSelectors } from './mock-rooted-parent-component.selectors';

export class MockRootedParentComponent extends getExtendedRootedComponent(
    MockRootedParentComponentSelectors,
    RootedComponent
) {
    private data = 'InitialParentData';

    get ParentField(): string {
        return this.data;
    }

    set ParentField(newData: string) {
        this.data = newData;
    }

    parentMethod(): string {
        return this.data;
    }
}
