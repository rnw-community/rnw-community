import type { RootedComponent } from '../rooted-component/rooted-component';
import type { SelectorMethods } from './selector-methods.type';
import type { SelectorObject } from './selector-object.type';

export type RootedComponentWithSelectors<T extends string> = RootedComponent<T> & {
    [TKey in SelectorMethods<T>]: SelectorObject;
};
