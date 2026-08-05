import { getExtendedRootedComponent$ } from '../get-extended-rooted-component$/get-extended-rooted-component$.js';

import { RootedComponent$Mock } from './rooted-component$.mock.js';
import { RootedExtendedComponent$SelectorsMock } from './rooted-extended-component$-selectors.mock.js';

export class RootedExtendedComponent$Mock extends getExtendedRootedComponent$(
    RootedExtendedComponent$SelectorsMock,
    RootedComponent$Mock
) {
    constructor() {
        super(RootedExtendedComponent$SelectorsMock.ExtendedRoot$);
    }
}
