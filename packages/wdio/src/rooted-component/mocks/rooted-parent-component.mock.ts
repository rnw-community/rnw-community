import { getExtendedRootedComponent } from '../get-extended-rooted-component/get-extended-rooted-component.js';
import { RootedComponent } from '../rooted-component.js';

import { RootedParentComponentSelectorsMock } from './rooted-parent-component-selectors.mock.js';

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
