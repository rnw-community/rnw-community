import { getExtendedComponent } from '../component/get-exteded-component/get-extended-component';

import { ComponentSelectorsMock } from './component-selectors.mock';
import { ParentComponentMock } from './parent-component.mock';

export class ComponentMock extends getExtendedComponent(ComponentSelectorsMock, ParentComponentMock) {}
