import { getComponent$ } from '../get-component$/get-component$';

import type { ComponentWithSelectors } from '../../type';

/**
 * Creates a component instance from a selectors enum whose values are raw WebdriverIO selectors instead of testIDs.
 *
 * @see https://github.com/rnw-community/rnw-community/blob/master/packages/wdio/readme.md#createcomponent
 */
export const createComponent$ = <T>(selectors: T): ComponentWithSelectors<T> => new (getComponent$<T>(selectors))();
