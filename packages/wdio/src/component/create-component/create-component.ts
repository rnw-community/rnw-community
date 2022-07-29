import { getComponent } from '../get-component/get-component';

import type { ComponentWithSelectors, Enum } from '../../type';

export const createComponent = <T extends string>(selectors: Enum<T>): ComponentWithSelectors<T> =>
    new (getComponent<T>(selectors))();
