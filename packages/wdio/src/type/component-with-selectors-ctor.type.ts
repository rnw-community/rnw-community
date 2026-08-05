import type { ComponentWithSelectors } from './component-with-selectors.type.js';
import type { Component } from '../component/component.js';

export type ComponentWithSelectorsCtor<T, A = unknown> = A extends Component
    ? new () => A & ComponentWithSelectors<T>
    : new () => ComponentWithSelectors<T>;
