import type { RootedComponent } from '../rooted-component/rooted-component';
import type { SelectorElement } from '../selector-element/selector-element';

export type RootedComponentWithSelectors<T> = Record<keyof T, SelectorElement & WebdriverIO.Element> &
    RootedComponent<T> &
    WebdriverIO.Element;
