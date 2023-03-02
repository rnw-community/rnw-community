import type { Component } from '../component/component';
import type { SelectorElement } from '../selector-element/selector-element';
import type { Element } from 'webdriverio';

export type ComponentWithSelectors<T> = Component<T> & Record<keyof T, Element & SelectorElement>;
