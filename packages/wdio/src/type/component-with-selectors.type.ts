import type { SelectorMethods } from './selector-methods.type';
import type { SelectorObject } from './selector-object.type';

export type ComponentWithSelectors<T extends string, TComponent> = TComponent & {
    [TKey in SelectorMethods<T, ''>]: SelectorObject;
};
