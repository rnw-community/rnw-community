import { getRootedComponent } from '../get-rooted-component/get-rooted-component';

import type { ComponentWithSelectors, Enum } from '../../type';

export const createRootedComponent = <T extends string>(
    selectors: Enum<T>,
    selectorOrElement?: WebdriverIO.Element | string
): ComponentWithSelectors<T> => new (getRootedComponent<T>(selectors))(selectorOrElement);
