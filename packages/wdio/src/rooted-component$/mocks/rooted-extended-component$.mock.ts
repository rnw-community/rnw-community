import { getExtendedRootedComponent$ } from '../get-extended-rooted-component$/get-extended-rooted-component$';

import { RootedComponent$Mock } from './rooted-component$.mock';
import { RootedExtendedComponent$SelectorsMock } from './rooted-extended-component$-selectors.mock';

export class RootedExtendedComponent$Mock extends getExtendedRootedComponent$(
    RootedExtendedComponent$SelectorsMock,
    RootedComponent$Mock
) {
    constructor() {
        super(RootedExtendedComponent$SelectorsMock.ExtendedRoot$);
    }
}
