import type { Component } from '../component/component.js';
import type { SelectorElement } from '../selector-element/selector-element.js';

export type ComponentWithSelectors<T> = Component<T> & Record<keyof T, SelectorElement & WebdriverIO.Element>;
