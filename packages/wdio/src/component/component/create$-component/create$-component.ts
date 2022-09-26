import { get$Component } from '../get$-component/get$-component';

import type { Enum } from '../../../type';
import type { ComponentWithSelectors } from '../../type';

export const create$Component = <T extends string>(selectors: Enum<T>): ComponentWithSelectors<T> =>
    new (get$Component<T>(selectors))();
