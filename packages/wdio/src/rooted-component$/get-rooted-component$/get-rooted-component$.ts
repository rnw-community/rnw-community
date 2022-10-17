import { RootedComponent } from '../../rooted-component/rooted-component';
import { getExtendedRootedComponent$ } from '../get-extended-rooted-component$/get-extended-rooted-component$';

import type { RootedComponentWithSelectorsCtor } from '../../type';

export const getRootedComponent$ = <T>(selectors: T): RootedComponentWithSelectorsCtor<T> =>
    getExtendedRootedComponent$(selectors, RootedComponent);
