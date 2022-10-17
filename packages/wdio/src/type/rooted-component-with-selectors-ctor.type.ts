import type { RootedComponent } from '../rooted-component/rooted-component';
import type { ComponentInputArg } from './component-input-arg.type';
import type { RootedComponentWithSelectors } from './rooted-component-with-selectors.type';

export type RootedComponentWithSelectorsCtor<T, A extends RootedComponent<T> = RootedComponent<T>> = new (
    selectorOrElement: ComponentInputArg
) => A & RootedComponentWithSelectors<T>;
