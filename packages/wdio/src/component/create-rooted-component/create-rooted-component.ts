import { getRootedComponent } from '../get-rooted-component/get-rooted-component';

import type { Enum } from '../../type';
import type { ComponentInputArg, RootedComponentWithSelectors } from '../type';

export const createRootedComponent = <T extends string>(
    selectors: Enum<T>,
    selectorOrElement?: ComponentInputArg
): RootedComponentWithSelectors<T> => new (getRootedComponent<T>(selectors))(selectorOrElement);
