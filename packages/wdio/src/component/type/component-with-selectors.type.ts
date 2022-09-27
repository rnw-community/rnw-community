import type { Component } from '../component/component';
import type { SelectorObject } from './selector-object.type';

export type ComponentWithSelectors<T> = Component<T> & Record<keyof T, SelectorObject>;
