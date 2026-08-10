import type { ComponentWithSelectors } from './component-with-selectors.type';
import type { Component } from '../component/component';

export type ComponentWithSelectorsCtor<T, A = unknown> = A extends Component
    ? new () => A & ComponentWithSelectors<T>
    : new () => ComponentWithSelectors<T>;
