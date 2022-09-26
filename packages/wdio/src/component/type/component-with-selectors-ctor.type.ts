import type { ComponentInputArg } from './component-input-arg.type';
import type { ComponentWithSelectors } from './component-with-selectors.type';

export type ComponentWithSelectorsCtor<T extends string> = new (
    selectorOrElement?: ComponentInputArg
) => ComponentWithSelectors<T>;
