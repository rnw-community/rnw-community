import { getRootedComponent } from '../get-rooted-component/get-rooted-component';

import type { ComponentWithSelectors, Enum } from '../../type';
import type { RootedComponent } from '../rooted-component/rooted-component';

export const createRootedComponent = <T extends string>(
    selectors: Enum<T>,
    selectorOrElement?: WebdriverIO.Element | string
): ComponentWithSelectors<T, RootedComponent> => new (getRootedComponent<T>(selectors))(selectorOrElement);
