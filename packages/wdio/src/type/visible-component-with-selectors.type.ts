import type { VisibleComponent } from '../component';
import type { SelectorMethods } from './selector-methods.type';

export type VisibleComponentWithSelectors<T extends string> = VisibleComponent & {
    [TKey in SelectorMethods<T, 'ClickByIdx'>]: (idx: number) => ReturnType<WebdriverIO.Element['click']>;
} & {
    [TKey in SelectorMethods<T, 'El'>]: Promise<WebdriverIO.Element>;
} & {
    [TKey in SelectorMethods<T, 'Els'>]: Promise<WebdriverIO.ElementArray>;
} & {
    [TKey in SelectorMethods<T, 'Exists'>]: ReturnType<WebdriverIO.Element['isExisting']>;
} & {
    [TKey in SelectorMethods<T, 'IsDisplayed'>]: ReturnType<WebdriverIO.Element['isDisplayed']>;
} & {
    [TKey in SelectorMethods<T, 'Text'>]: ReturnType<WebdriverIO.Element['getText']>;
} & {
    [TKey in SelectorMethods<T, 'WaitForDisplayed'>]: ReturnType<WebdriverIO.Element['waitForDisplayed']>;
} & {
    [TKey in SelectorMethods<T, 'WaitForExists'>]: ReturnType<WebdriverIO.Element['waitForExist']>;
} & { [TKey in SelectorMethods<T, 'Click'>]: ReturnType<WebdriverIO.Element['click']> };
