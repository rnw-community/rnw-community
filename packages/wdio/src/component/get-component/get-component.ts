import { Component } from '../component';
import { getExtendedComponent } from '../get-exteded-component/get-extended-component';

import type { ComponentWithSelectorsCtor } from '../../type';

export const getComponent = <T>(selectors: T): ComponentWithSelectorsCtor<T> => getExtendedComponent(selectors, Component);
