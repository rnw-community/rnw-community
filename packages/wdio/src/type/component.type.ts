import type { ComponentWithSelectors } from './component-with-selectors.type';
import type { RootedComponentWithSelectors } from './rooted-component-with-selectors.type';
import type { Component } from '../component/component';
import type { RootedComponent } from '../rooted-component/rooted-component';

export type ComponentType<E extends string, T extends Component<E> = Component<E>> = T extends RootedComponent
    ? RootedComponentWithSelectors<E>
    : ComponentWithSelectors<E>;
