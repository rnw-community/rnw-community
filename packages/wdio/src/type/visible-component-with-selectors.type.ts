import type { VisibleComponent } from '../component';
import type { SelectorMethods } from './selector-methods.type';

export type VisibleComponentWithSelectors<T extends string> = VisibleComponent & {
    [TKey in SelectorMethods<T, 'ClickByIdx'>]: (idx: number) => Promise<void>;
} & {
    [TKey in SelectorMethods<T, 'El'>]: Promise<WebdriverIO.Element>;
} & {
    [TKey in SelectorMethods<T, 'Els'>]: Promise<WebdriverIO.ElementArray>;
} & {
    [TKey in SelectorMethods<T, 'Exists'>]: Promise<boolean>;
} & {
    [TKey in SelectorMethods<T, 'IsDisplayed'>]: Promise<boolean>;
} & {
    [TKey in SelectorMethods<T, 'Text'>]: Promise<string>;
} & {
    [TKey in SelectorMethods<T, 'WaitForDisplayed'>]: Promise<void>;
} & {
    [TKey in SelectorMethods<T, 'WaitForExists'>]: Promise<void>;
} & { [TKey in SelectorMethods<T, 'Click'>]: Promise<void> };
