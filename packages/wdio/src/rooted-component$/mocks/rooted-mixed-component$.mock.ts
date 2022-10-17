import { RootedComponentMock } from '../../rooted-component/mocks/rooted-component.mock';
import { getExtendedRootedComponent$ } from '../get-extended-rooted-component$/get-extended-rooted-component$';

import { RootedComponent$SelectorsMock } from './rooted-component$-selectors.mock';

export class RootedMixedComponent$Mock extends getExtendedRootedComponent$(
    RootedComponent$SelectorsMock,
    RootedComponentMock
) {
    constructor() {
        super(RootedComponent$SelectorsMock.Root$);
    }
}
