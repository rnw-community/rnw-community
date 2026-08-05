import { getExtendedComponent } from '../get-exteded-component/get-extended-component.js';

import { ComponentSelectorsMock } from './component-selectors.mock.js';
import { ParentComponentMock } from './parent-component.mock.js';

export class ComponentMock extends getExtendedComponent(ComponentSelectorsMock, ParentComponentMock) {
    private testData = 'initial-data';

    get TestData(): string {
        return this.testData;
    }

    set TestData(data: string) {
        this.testData = data;
    }

    getTestData(): string {
        return this.testData;
    }

    setTestData(data: string): void {
        this.testData = data;
    }
}
