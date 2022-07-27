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
    [TKey in SelectorMethods<T, 'SetValue'>]: (value: string) => Promise<void>;
} & {
    [TKey in SelectorMethods<T, 'Text'>]: Promise<string>;
} & {
    [TKey in SelectorMethods<T, 'WaitForDisplayed'>]: (
        ...args: Parameters<WebdriverIO.Element['waitForExist']>
    ) => Promise<void>;
} & {
    [TKey in SelectorMethods<T, 'WaitForEnabled'>]: (
        ...args: Parameters<WebdriverIO.Element['waitForEnabled']>
    ) => Promise<void>;
} & {
    [TKey in SelectorMethods<T, 'WaitForExists'>]: (
        ...args: Parameters<WebdriverIO.Element['waitForDisplayed']>
    ) => Promise<void>;
} & { [TKey in SelectorMethods<T, 'Click'>]: Promise<void> };
