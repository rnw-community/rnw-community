import type { Component } from '../component/component';
import type { SelectorElement } from '../selector-element/selector-element';

export type ComponentWithSelectors<T> = Component<T> & Record<keyof T, SelectorElement & WebdriverIO.Element>;
