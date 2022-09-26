import { get$Component } from '../get$-component/get$-component';

import type { ComponentWithSelectors } from '../../type';
import type { Enum } from '@rnw-community/shared';

export const create$Component = <T extends string>(selectors: Enum<T>): ComponentWithSelectors<T> =>
    new (get$Component<T>(selectors))();