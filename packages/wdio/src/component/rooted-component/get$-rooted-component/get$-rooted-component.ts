import { default$ComponentConfig } from '../../default$-component.config';
import { getRootedComponent } from '../get-rooted-component/get-rooted-component';

import type { RootedComponentWithSelectorsCtor } from '../../type';

export const get$RootedComponent = <T>(selectors: T): RootedComponentWithSelectorsCtor<T> =>
    getRootedComponent(selectors, default$ComponentConfig());
