import { get$Component } from '../get$-component/get$-component';

import type { ComponentWithSelectors } from '../../type';

export const create$Component = <T>(selectors: T): ComponentWithSelectors<T> => new (get$Component<T>(selectors))();
