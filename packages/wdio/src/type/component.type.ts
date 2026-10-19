import type { ComponentWithSelectors } from './component-with-selectors.type';
import type { RootedComponentWithSelectors } from './rooted-component-with-selectors.type';
import type { Component } from '../component/component';
import type { RootedComponent } from '../rooted-component/rooted-component';

/**
 * Resolves the instance type of a component class to its rooted or plain selector-aware component type.
 *
 * @see https://github.com/rnw-community/rnw-community/blob/master/packages/wdio/readme.md#components
 */
export type ComponentType<E extends string, T extends Component<E> = Component<E>> = T extends RootedComponent
    ? RootedComponentWithSelectors<E>
    : ComponentWithSelectors<E>;
