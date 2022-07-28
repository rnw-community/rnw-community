import { getVisibleComponent } from '../get-visible-component/get-visible-component';

import type { Enum, VisibleComponentWithSelectors } from '../../type';

export const createVisibleComponent = <T extends string>(
    selectors: Enum<T>,
    rootEl?: WebdriverIO.Browser
): VisibleComponentWithSelectors<T> => new (getVisibleComponent<T>(selectors))(rootEl);
