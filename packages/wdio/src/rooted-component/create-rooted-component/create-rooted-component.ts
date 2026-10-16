import { getRootedComponent } from '../get-rooted-component/get-rooted-component';

import type { ComponentInputArg, RootedComponentWithSelectors } from '../../type';

/**
 * Creates a testID-based component instance from a selectors enum, scoped to a root selector or element.
 *
 * @see https://github.com/rnw-community/rnw-community/blob/master/packages/wdio/readme.md#createrootedcomponent
 */
export const createRootedComponent = <T>(
    selectors: T,
    selectorOrElement: ComponentInputArg
): RootedComponentWithSelectors<T> => new (getRootedComponent<T>(selectors))(selectorOrElement);
