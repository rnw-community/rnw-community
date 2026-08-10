import { getExtendedRootedComponent$ } from '../get-extended-rooted-component$/get-extended-rooted-component$';

import { RootedComponent$SelectorsMock } from './rooted-component$-selectors.mock';
import { RootedComponent$Mock } from './rooted-component$.mock';

export class DefaultRootRootedExtendedComponent$Mock extends getExtendedRootedComponent$(
    RootedComponent$SelectorsMock,
    RootedComponent$Mock,
    RootedComponent$SelectorsMock.Root$
) {}
