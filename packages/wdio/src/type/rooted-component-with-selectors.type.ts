import type { RootedComponent } from '../rooted-component/rooted-component';
import type { SelectorElement } from '../selector-element/selector-element';
import type { Element } from 'webdriverio';

export type RootedComponentWithSelectors<T> = Element & Record<keyof T, Element & SelectorElement> & RootedComponent<T>;
