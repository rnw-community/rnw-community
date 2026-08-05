import { getRootedComponent$ } from '../get-rooted-component$/get-rooted-component$.js';

import type { ComponentInputArg, RootedComponentWithSelectors } from '../../type/index.js';

export const createRootedComponent$ = <T>(
    selectors: T,
    selectorOrElement: ComponentInputArg
): RootedComponentWithSelectors<T> => new (getRootedComponent$<T>(selectors))(selectorOrElement);
