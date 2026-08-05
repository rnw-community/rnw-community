import type { RootedComponent } from '../rooted-component/rooted-component.js';
import type { SelectorElement } from '../selector-element/selector-element.js';

export type RootedComponentWithSelectors<T> = Record<keyof T, SelectorElement & WebdriverIO.Element> &
    RootedComponent<T> &
    WebdriverIO.Element;
