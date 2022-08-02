import { getRootedComponent } from '../get-rooted-component/get-rooted-component';

import type { Enum } from '../../type';
import type { RootedComponentWithSelectors } from '../type';

export const createRootedComponent = <T extends string>(
    selectors: Enum<T>,
    selectorOrElement?: WebdriverIO.Element | string
): RootedComponentWithSelectors<T> => new (getRootedComponent<T>(selectors))(selectorOrElement);
