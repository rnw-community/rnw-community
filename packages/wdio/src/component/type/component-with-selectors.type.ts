import type { Component } from '../component/component';
import type { SelectorMethods } from './selector-methods.type';
import type { SelectorObject } from './selector-object.type';

export type ComponentWithSelectors<T extends string> = Component<T> & {
    [TKey in SelectorMethods<T>]: SelectorObject;
};
