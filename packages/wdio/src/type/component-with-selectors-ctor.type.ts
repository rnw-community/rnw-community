import type { ComponentWithSelectors } from './component-with-selectors.type';
import type { Component } from '../component/component';

/**
 * The constructor type of a component class returned by `getComponent` and `getExtendedComponent`.
 *
 * @see https://github.com/rnw-community/rnw-community/blob/master/packages/wdio/readme.md#getcomponent
 */
export type ComponentWithSelectorsCtor<T, A = unknown> = A extends Component
    ? new () => A & ComponentWithSelectors<T>
    : new () => ComponentWithSelectors<T>;
