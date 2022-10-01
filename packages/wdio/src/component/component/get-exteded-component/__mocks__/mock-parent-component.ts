import { Component } from '../../component';
import { getExtendedComponent } from '../get-extended-component';

import { MockParentComponentSelectors } from './mock-parent-component.selectors';

export class MockParentComponent extends getExtendedComponent(MockParentComponentSelectors, Component) {
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
