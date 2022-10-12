import { getExtendedRootedComponent } from '../get-extended-rooted-component/get-extended-rooted-component';
import { RootedComponent } from '../rooted-component';

import { RootedParentComponentSelectorsMock } from './rooted-parent-component-selectors.mock';

export class RootedParentComponentMock extends getExtendedRootedComponent(
    RootedParentComponentSelectorsMock,
    RootedComponent
) {
    private parentData = 'parent-initial-data';

    get ParentData(): string {
        return this.parentData;
    }

    set ParentData(newData: string) {
        this.parentData = newData;
    }

    getParentData(): string {
        return this.parentData;
    }

    setParentData(data: string): void {
        this.parentData = data;
    }
}
