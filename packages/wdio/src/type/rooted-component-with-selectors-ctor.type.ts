import type { ComponentInputArg } from './component-input-arg.type';
import type { RootedComponentWithSelectors } from './rooted-component-with-selectors.type';
import type { RootedComponent } from '../rooted-component/rooted-component';

export type RootedComponentCtorWithoutDefaultRootSelector<T, Parent extends RootedComponent<T> = RootedComponent<T>> = new (
    selectorOrElement: ComponentInputArg
) => Parent & RootedComponentWithSelectors<T>;

export type RootedComponentCtorWithDefaultRootSelector<T, Parent extends RootedComponent<T> = RootedComponent<T>> = new (
    selectorOrElement?: ComponentInputArg
) => Parent & RootedComponentWithSelectors<T>;

export type RootedComponentWithSelectorsCtor<T, Parent extends RootedComponent<T> = RootedComponent<T>> =
    | RootedComponentCtorWithDefaultRootSelector<T, Parent>
    | RootedComponentCtorWithoutDefaultRootSelector<T, Parent>;
