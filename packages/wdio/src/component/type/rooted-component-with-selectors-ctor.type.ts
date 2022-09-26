import type { ComponentInputArg } from './component-input-arg.type';
import type { RootedComponentWithSelectors } from './rooted-component-with-selectors.type';

export type RootedComponentWithSelectorsCtor<T extends string> = new (
    selectorOrElement?: ComponentInputArg
) => RootedComponentWithSelectors<T>;
