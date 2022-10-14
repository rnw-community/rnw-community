import { getRootedComponent } from '../get-rooted-component/get-rooted-component';

import type { ComponentConfigInterface, ComponentInputArg, RootedComponentWithSelectors } from '../../type';

export const createRootedComponent = <T>(
    selectors: T,
    selectorOrElement: ComponentInputArg,
    config?: ComponentConfigInterface
): RootedComponentWithSelectors<T> => new (getRootedComponent<T>(selectors, config))(selectorOrElement);
