import { getRootedComponent$ } from '../get-rooted-component$/get-rooted-component$.js';

import { RootedComponent$SelectorsMock } from './rooted-component$-selectors.mock.js';

export class DefaultRootRootedComponent$Mock extends getRootedComponent$(
    RootedComponent$SelectorsMock,
    RootedComponent$SelectorsMock.Root$
) {}
