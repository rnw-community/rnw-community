import type { Component } from '../component/component';
import type { SelectorElement } from '../selector-element/selector-element';

/**
 * A component instance exposing each selectors-enum key as a `SelectorElement` usable as a WebdriverIO element.
 *
 * @see https://github.com/rnw-community/rnw-community/blob/master/packages/wdio/readme.md#components
 */
export type ComponentWithSelectors<T> = Component<T> & Record<keyof T, SelectorElement & WebdriverIO.Element>;
