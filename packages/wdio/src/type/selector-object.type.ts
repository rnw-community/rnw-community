import type { SetValueArgs, WaitForDisplayedArgs, WaitForEnabledArgs, WaitForExistArgs } from './wdio-types.type';

// TODO: Add WebdriverIO typing
export interface SelectorObject {
    click: () => Promise<void>;
    clickByIdx: (idx: number) => Promise<void>;
    getText: () => Promise<string>;
    isDisplayed: () => Promise<boolean>;
    isExisting: () => Promise<boolean>;
    setValue: (...args: SetValueArgs) => Promise<void>;
    waitForDisplayed: (...args: WaitForDisplayedArgs) => Promise<void>;
    waitForEnabled: (...args: WaitForEnabledArgs) => Promise<void>;
    waitForExist: (...args: WaitForExistArgs) => Promise<void>;
}
