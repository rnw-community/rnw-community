import { getRootedComponent } from '../get-rooted-component/get-rooted-component';

import type { ComponentConfigInterface, ComponentInputArg, RootedComponentWithSelectors } from '../../type';
import type { Enum } from '@rnw-community/shared';

export const createRootedComponent = <T extends string>(
    selectors: Enum<T>,
    selectorOrElement?: ComponentInputArg,
    config?: ComponentConfigInterface
): RootedComponentWithSelectors<T> => new (getRootedComponent<T>(selectors, config))(selectorOrElement);
