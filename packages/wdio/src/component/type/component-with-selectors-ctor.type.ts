import type { ComponentWithSelectors } from './component-with-selectors.type';

export type ComponentWithSelectorsCtor<T extends string = '', A = unknown> = new () => A & ComponentWithSelectors<T>;
