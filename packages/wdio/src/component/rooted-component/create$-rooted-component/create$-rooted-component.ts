import { get$RootedComponent } from '../get$-rooted-component/get$-rooted-component';

import type { Enum } from '../../../type';
import type { ComponentInputArg, RootedComponentWithSelectors } from '../../type';

export const create$RootedComponent = <T extends string>(
    selectors: Enum<T>,
    selectorOrElement?: ComponentInputArg
): RootedComponentWithSelectors<T> => new (get$RootedComponent<T>(selectors))(selectorOrElement);
