import { getComponent } from '../get-component/get-component';

import type { ComponentWithSelectors, Enum } from '../../type';
import type { Component } from '../component/component';

export const createComponent = <T extends string>(selectors: Enum<T>): ComponentWithSelectors<T, Component> =>
    new (getComponent<T>(selectors))();
