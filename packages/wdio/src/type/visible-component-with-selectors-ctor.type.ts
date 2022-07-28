import type { VisibleComponentWithSelectors } from './visible-component-with-selectors.type';

export type VisibleComponentWithSelectorsCtor<T extends string> = new (
    selectorOrElement?: WebdriverIO.Element | string
) => VisibleComponentWithSelectors<T>;
