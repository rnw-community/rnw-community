import { getVisibleComponent } from '../get-visible-component/get-visible-component';

import type { SelectorContextType, VisibleComponentWithSelectors } from '../../type';
import type { Enum } from '../../type/enum.type';

export const createVisibleComponent = <T extends string>(
    selectors: Enum<T>,
    selectorOrContext: SelectorContextType | string
): VisibleComponentWithSelectors<T> => new (getVisibleComponent<T>(selectors))(selectorOrContext);
