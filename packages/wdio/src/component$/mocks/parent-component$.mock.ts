import { getExtendedComponent } from '../../component/get-exteded-component/get-extended-component';

import { Component$Mock } from './component$.mock';
import { ParentComponent$SelectorsMock } from './parent-component$-selectors.mock';

export class ParentComponent$Mock extends getExtendedComponent(ParentComponent$SelectorsMock, Component$Mock) {}
