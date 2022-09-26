import { getRootedComponent } from '../get-rooted-component/get-rooted-component';

import type { Enum } from '../../../type';
import type { ComponentInputArg, RootedComponentWithSelectors } from '../../type';
import type { ComponentConfigInterface } from '../../type/component-config-arg.type';

export const createRootedComponent = <T extends string>(
    selectors: Enum<T>,
    selectorOrElement?: ComponentInputArg,
    config?: ComponentConfigInterface
): RootedComponentWithSelectors<T> => new (getRootedComponent<T>(selectors, config))(selectorOrElement);
