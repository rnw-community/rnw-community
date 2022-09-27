import { getComponent } from '../get-component/get-component';

import type { ComponentWithSelectors } from '../../type';
import type { Enum } from '@rnw-community/shared';

export const createComponent = <T extends string>(selectors: Enum<T>): ComponentWithSelectors<T> =>
    new (getComponent<T>(selectors))();
