import { default$ComponentConfig } from '../../default$-component.config';
import { getRootedComponent } from '../get-rooted-component/get-rooted-component';

import type { RootedComponentWithSelectorsCtor } from '../../type';
import type { Enum } from '@rnw-community/shared';

export const get$RootedComponent = <T extends string>(selectors: Enum<T>): RootedComponentWithSelectorsCtor<T> =>
    getRootedComponent(selectors, default$ComponentConfig);
