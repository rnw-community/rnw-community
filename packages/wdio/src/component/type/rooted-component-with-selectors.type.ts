import type { RootedComponent } from '../rooted-component/rooted-component';
import type { SelectorElement } from '../selector-element/selector-element';

export type RootedComponentWithSelectors<T> = Omit<Record<keyof T, SelectorElement & WebdriverIO.Element>, 'Root'> &
    RootedComponent<T>;
