import { getExtendedRootedComponent } from '../get-extended-rooted-component/get-extended-rooted-component';

import { RootedComponentSelectorsMock } from './rooted-component-selectors.mock';
import { RootedParentComponentMock } from './rooted-parent-component.mock';

export class RootedComponentMock extends getExtendedRootedComponent(
    RootedComponentSelectorsMock,
    RootedParentComponentMock
) {
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
