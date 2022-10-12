import type { Component } from '../component/component';
import type { RootedComponent } from '../rooted-component/rooted-component';
import type { ComponentWithSelectors } from './component-with-selectors.type';
import type { RootedComponentWithSelectors } from './rooted-component-with-selectors.type';

export type ComponentType<E extends string, T extends Component<E> = Component<E>> = T extends RootedComponent
    ? RootedComponentWithSelectors<E>
    : ComponentWithSelectors<E>;
