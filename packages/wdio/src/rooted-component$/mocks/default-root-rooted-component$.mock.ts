import { getRootedComponent$ } from '../get-rooted-component$/get-rooted-component$';

import { RootedComponent$SelectorsMock } from './rooted-component$-selectors.mock';

export class DefaultRootRootedComponent$Mock extends getRootedComponent$(
    RootedComponent$SelectorsMock,
    RootedComponent$SelectorsMock.Root$
) {}
