import { get$RootedComponent } from '../get$-rooted-component/get$-rooted-component';

import type { ComponentInputArg, RootedComponentWithSelectors } from '../../type';

export const create$RootedComponent = <T>(
    selectors: T,
    selectorOrElement: ComponentInputArg
): RootedComponentWithSelectors<T> => new (get$RootedComponent<T>(selectors))(selectorOrElement);
