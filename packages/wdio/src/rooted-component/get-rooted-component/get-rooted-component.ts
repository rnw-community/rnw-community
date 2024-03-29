import { isDefined } from '@rnw-community/shared';

import { getExtendedRootedComponent } from '../get-extended-rooted-component/get-extended-rooted-component';
import { RootedComponent } from '../rooted-component';

import type {
    RootedComponentCtorWithDefaultRootSelector,
    RootedComponentCtorWithoutDefaultRootSelector,
} from '../../type/rooted-component-with-selectors-ctor.type';

export function getRootedComponent<T>(selectors: T): RootedComponentCtorWithoutDefaultRootSelector<T>;
export function getRootedComponent<T>(selectors: T, rootSelector: T[keyof T]): RootedComponentCtorWithDefaultRootSelector<T>;

// eslint-disable-next-line func-style,@typescript-eslint/no-explicit-any
export function getRootedComponent<T>(selectors: T, rootSelector?: T[keyof T]): any {
    if (isDefined(rootSelector)) {
        return getExtendedRootedComponent(selectors, RootedComponent, rootSelector);
    }

    return getExtendedRootedComponent(selectors, RootedComponent);
}
