import { getExtendedComponent$ } from '../get-exteded-component$/get-extended-component$.js';

import { Component$Mock } from './component$.mock.js';
import { ParentComponent$SelectorsMock } from './parent-component$-selectors.mock.js';

export class ExtendedComponent$Mock extends getExtendedComponent$(ParentComponent$SelectorsMock, Component$Mock) {}
