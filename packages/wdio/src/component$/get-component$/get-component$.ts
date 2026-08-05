import { Component } from '../../component/component.js';
import { getExtendedComponent$ } from '../get-exteded-component$/get-extended-component$.js';

import type { ComponentWithSelectorsCtor } from '../../type/index.js';

export const getComponent$ = <T>(selectors: T): ComponentWithSelectorsCtor<T> => getExtendedComponent$(selectors, Component);
