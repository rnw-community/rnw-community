import type { ComponentWithSelectors } from './component-with-selectors.type.js';
import type { RootedComponentWithSelectors } from './rooted-component-with-selectors.type.js';
import type { Component } from '../component/component.js';
import type { RootedComponent } from '../rooted-component/rooted-component.js';

export type ComponentType<E extends string, T extends Component<E> = Component<E>> = T extends RootedComponent
    ? RootedComponentWithSelectors<E>
    : ComponentWithSelectors<E>;
