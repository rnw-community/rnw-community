import { default$ComponentConfig } from '../../default$-component.config';
import { getRootedComponent } from '../get-rooted-component/get-rooted-component';

import type { Enum } from '../../../type';
import type { RootedComponentWithSelectorsCtor } from '../../type';

export const get$RootedComponent = <T extends string>(selectors: Enum<T>): RootedComponentWithSelectorsCtor<T> =>
    getRootedComponent(selectors, default$ComponentConfig);
