import { RootedComponentMock } from '../../rooted-component/mocks/rooted-component.mock.js';
import { getExtendedRootedComponent$ } from '../get-extended-rooted-component$/get-extended-rooted-component$.js';

import { RootedComponent$SelectorsMock } from './rooted-component$-selectors.mock.js';

export class RootedMixedComponent$Mock extends getExtendedRootedComponent$(
    RootedComponent$SelectorsMock,
    RootedComponentMock
) {
    constructor() {
        super(RootedComponent$SelectorsMock.Root$);
    }
}
