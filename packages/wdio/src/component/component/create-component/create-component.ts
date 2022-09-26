import { getComponent } from '../get-component/get-component';

import type { Enum } from '../../../type';
import type { ComponentWithSelectors } from '../../type';

export const createComponent = <T extends string>(selectors: Enum<T>): ComponentWithSelectors<T> =>
    new (getComponent<T>(selectors))();
