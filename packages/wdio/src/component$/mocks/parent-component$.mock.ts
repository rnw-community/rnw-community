import { getExtendedComponent } from '../../component/get-exteded-component/get-extended-component.js';

import { Component$Mock } from './component$.mock.js';
import { ParentComponent$SelectorsMock } from './parent-component$-selectors.mock.js';

export class ParentComponent$Mock extends getExtendedComponent(ParentComponent$SelectorsMock, Component$Mock) {}
