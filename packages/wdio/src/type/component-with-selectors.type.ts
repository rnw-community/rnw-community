import type { Component } from '../component';
import type { SelectorMethods } from './selector-methods.type';
import type { SelectorObject } from './selector-object.type';

export type ComponentWithSelectors<T extends string> = Component & {
    [TKey in SelectorMethods<T, ''>]: SelectorObject;
};
