import { Component } from '../component';
import { getExtendedComponent } from '../get-exteded-component/get-extended-component';

import type { ComponentWithSelectorsCtor } from '../../type';

/**
 * Returns a testID-based component class for a selectors enum, for extending with custom page-object methods.
 *
 * @see https://github.com/rnw-community/rnw-community/blob/master/packages/wdio/readme.md#getcomponent
 */
export const getComponent = <T>(selectors: T): ComponentWithSelectorsCtor<T> => getExtendedComponent(selectors, Component);
