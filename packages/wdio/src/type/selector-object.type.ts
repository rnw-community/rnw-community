import type { SetValueArgs, WaitForDisplayedArgs, WaitForEnabledArgs, WaitForExistArgs } from './wdio-types.type';

// TODO: Add WebdriverIO return types, would be nice if we could reference original wdio methods for intelisense
export interface SelectorObject {
    byIdx: (idx: number) => Promise<WebdriverIO.Element>;
    click: () => Promise<void>;
    clickByIdx: (idx: number) => Promise<void>;
    el: () => Promise<WebdriverIO.Element>;
    els: () => Promise<WebdriverIO.ElementArray>;
    getText: () => Promise<string>;
    isDisplayed: () => Promise<boolean>;
    isExisting: () => Promise<boolean>;
    setValue: (...args: SetValueArgs) => Promise<void>;
    waitForDisplayed: (...args: WaitForDisplayedArgs) => Promise<void>;
    waitForEnabled: (...args: WaitForEnabledArgs) => Promise<void>;
    waitForExist: (...args: WaitForExistArgs) => Promise<void>;
}
