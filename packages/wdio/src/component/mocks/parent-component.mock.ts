import { Component } from '../component/component';
import { getExtendedComponent } from '../component/get-exteded-component/get-extended-component';

import { ParentComponentSelectorsMock } from './parent-component-selectors.mock';

export class ParentComponentMock extends getExtendedComponent(ParentComponentSelectorsMock, Component) {
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
