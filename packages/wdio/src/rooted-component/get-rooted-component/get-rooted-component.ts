import { getExtendedRootedComponent } from '../get-extended-rooted-component/get-extended-rooted-component';
import { RootedComponent } from '../rooted-component';

import type { RootedComponentWithSelectorsCtor } from '../../type';

export const getRootedComponent = <T>(selectors: T): RootedComponentWithSelectorsCtor<T> =>
    getExtendedRootedComponent(selectors, RootedComponent);
