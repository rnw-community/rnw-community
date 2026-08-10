import { getComponent$ } from '../get-component$/get-component$';

import type { ComponentWithSelectors } from '../../type';

export const createComponent$ = <T>(selectors: T): ComponentWithSelectors<T> => new (getComponent$<T>(selectors))();
