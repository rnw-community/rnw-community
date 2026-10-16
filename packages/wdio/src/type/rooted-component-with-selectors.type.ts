import type { RootedComponent } from '../rooted-component/rooted-component';
import type { SelectorElement } from '../selector-element/selector-element';

/**
 * A rooted component instance exposing each selectors-enum key as a `SelectorElement` and proxying unknown members to its root element.
 *
 * @see https://github.com/rnw-community/rnw-community/blob/master/packages/wdio/readme.md#createrootedcomponent
 */
export type RootedComponentWithSelectors<T> = Record<keyof T, SelectorElement & WebdriverIO.Element> &
    RootedComponent<T> &
    WebdriverIO.Element;
