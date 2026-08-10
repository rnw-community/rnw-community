import { getRootedComponent } from '../get-rooted-component/get-rooted-component';

import type { ComponentInputArg, RootedComponentWithSelectors } from '../../type';

export const createRootedComponent = <T>(
    selectors: T,
    selectorOrElement: ComponentInputArg
): RootedComponentWithSelectors<T> => new (getRootedComponent<T>(selectors))(selectorOrElement);
