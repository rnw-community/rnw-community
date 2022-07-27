import type { SelectorContextType } from './selector-context.type';
import type { VisibleComponentWithSelectors } from './visible-component-with-selectors.type';

export type VisibleComponentWithSelectorsCtor<T extends string> = new (
    selectorOrElement?: SelectorContextType | string
) => VisibleComponentWithSelectors<T>;
