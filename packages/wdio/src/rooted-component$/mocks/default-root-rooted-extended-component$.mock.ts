import { getExtendedRootedComponent$ } from '../get-extended-rooted-component$/get-extended-rooted-component$.js';

import { RootedComponent$SelectorsMock } from './rooted-component$-selectors.mock.js';
import { RootedComponent$Mock } from './rooted-component$.mock.js';

export class DefaultRootRootedExtendedComponent$Mock extends getExtendedRootedComponent$(
    RootedComponent$SelectorsMock,
    RootedComponent$Mock,
    RootedComponent$SelectorsMock.Root$
) {}
