import type {
    ClickArgs,
    ScrollIntoViewArgs,
    SetValueArgs,
    WaitForDisplayedArgs,
    WaitForEnabledArgs,
    WaitForExistArgs,
} from './wdio-types.type';
import type { ChainablePromiseArray, ChainablePromiseElement } from 'webdriverio';
import type { Location } from 'webdriverio/build/commands/element/getLocation';
import type { Size } from 'webdriverio/build/commands/element/getSize';

// TODO: Add WebdriverIO return types, would be nice if we could reference original wdio methods for intelisense
export interface SelectorObject {
    byIdx: (idx: number) => ChainablePromiseElement<WebdriverIO.Element>;
    click: (...args: ClickArgs) => Promise<void>;
    clickByIdx: (idx: number) => Promise<void>;
    el: () => ChainablePromiseElement<WebdriverIO.Element>;
    els: () => ChainablePromiseArray<WebdriverIO.ElementArray>;
    getLocation: () => Promise<Location>;
    getSize: () => Promise<Size>;
    getText: () => Promise<string>;
    getValue: () => Promise<string>;
    isDisplayed: () => Promise<boolean>;
    isExisting: () => Promise<boolean>;
    scrollIntoView: (...args: ScrollIntoViewArgs) => Promise<void>;
    setValue: (...args: SetValueArgs) => Promise<void>;
    waitForDisplayed: (...args: WaitForDisplayedArgs) => Promise<void>;
    waitForEnabled: (...args: WaitForEnabledArgs) => Promise<void>;
    waitForExist: (...args: WaitForExistArgs) => Promise<void>;
}
