import { getComponent } from '../get-component/get-component.js';

import type { ComponentWithSelectors } from '../../type/index.js';

export const createComponent = <T>(selectors: T): ComponentWithSelectors<T> => new (getComponent<T>(selectors))();
