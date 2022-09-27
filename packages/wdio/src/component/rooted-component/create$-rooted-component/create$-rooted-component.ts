import { get$RootedComponent } from '../get$-rooted-component/get$-rooted-component';

import type { ComponentInputArg, RootedComponentWithSelectors } from '../../type';
import type { Enum } from '@rnw-community/shared';

export const create$RootedComponent = <T extends string>(
    selectors: Enum<T>,
    selectorOrElement?: ComponentInputArg
): RootedComponentWithSelectors<T> => new (get$RootedComponent<T>(selectors))(selectorOrElement);
