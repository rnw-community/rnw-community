import { Component } from '../../component/component';
import { getExtendedComponent$ } from '../get-exteded-component$/get-extended-component$';

import type { ComponentWithSelectorsCtor } from '../../type';

/**
 * Returns a component class for a selectors enum whose values are raw WebdriverIO selectors instead of testIDs.
 *
 * @see https://github.com/rnw-community/rnw-community/blob/master/packages/wdio/readme.md#getcomponent
 */
export const getComponent$ = <T>(selectors: T): ComponentWithSelectorsCtor<T> => getExtendedComponent$(selectors, Component);
