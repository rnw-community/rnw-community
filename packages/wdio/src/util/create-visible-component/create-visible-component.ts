import { getVisibleComponent } from '../get-visible-component/get-visible-component';

import type { Enum, SelectorContextType, VisibleComponentWithSelectors } from '../../type';

export const createVisibleComponent = <T extends string>(
    selectors: Enum<T>,
    selectorOrContext: SelectorContextType | string
): VisibleComponentWithSelectors<T> => new (getVisibleComponent<T>(selectors))(selectorOrContext);
