import { getExtendedComponent } from '../get-exteded-component/get-extended-component';

import { ComponentSelectorsMock } from './component-selectors.mock';
import { ParentComponentMock } from './parent-component.mock';

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
