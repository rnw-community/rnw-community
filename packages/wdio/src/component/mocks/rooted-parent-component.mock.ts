import { getExtendedRootedComponent } from '../rooted-component/get-extended-rooted-component/get-extended-rooted-component';
import { RootedComponent } from '../rooted-component/rooted-component';

import { RootedParentComponentSelectorsMock } from './rooted-parent-component-selectors.mock';

export class RootedParentComponentMock extends getExtendedRootedComponent(
    RootedParentComponentSelectorsMock,
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
