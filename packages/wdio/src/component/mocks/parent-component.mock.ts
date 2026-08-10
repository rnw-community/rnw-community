import { Component } from '../component';
import { getExtendedComponent } from '../get-exteded-component/get-extended-component';

import { ParentComponentSelectorsMock } from './parent-component-selectors.mock';

export class ParentComponentMock extends getExtendedComponent(ParentComponentSelectorsMock, Component) {
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
