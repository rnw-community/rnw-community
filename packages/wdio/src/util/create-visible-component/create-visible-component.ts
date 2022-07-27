import { getVisibleComponent } from '../get-visible-component/get-visible-component';

import type { VisibleComponentWithSelectors } from '../../type';

export const createVisibleComponent = <T extends string, E>(selectors: E): VisibleComponentWithSelectors<T> =>
    new (getVisibleComponent<T>(selectors))();
