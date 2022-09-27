import type { ComponentWithSelectors } from './component-with-selectors.type';

export type ComponentWithSelectorsCtor<T, A = unknown> = new () => A & ComponentWithSelectors<T>;
